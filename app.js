// app.js — WhatsApp + OpenRouter AI Bot with RAG (Pinecone Integrated Inference)
const express = require("express");
const axios = require("axios");
const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

const app = express();
app.use(express.json({ limit: "10mb" }));

// ==== CONFIG FROM ENV ====
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WA_TOKEN = process.env.WA_TOKEN;
const PHONE_ID = process.env.PHONE_ID;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || "whatsapp-memory-v2";

// Validate required environment variables
if (
  !VERIFY_TOKEN ||
  !WA_TOKEN ||
  !PHONE_ID ||
  !OPENROUTER_KEY ||
  !PINECONE_API_KEY
) {
  console.error("Missing required environment variables!");
  process.exit(1);
}

// ==== INITIALIZE PINECONE ====
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(PINECONE_INDEX);

// ==== HELPER: Get user's Pinecone namespace ====
function getUserNamespace(phoneNumber) {
  return `user_${phoneNumber}`;
}

// ==== HELPER: Save message to Pinecone (integrated inference) ====
async function saveMessageToPinecone(phoneNumber, messageText, role = "user") {
  try {
    const namespace = getUserNamespace(phoneNumber);
    const messageId = `${role}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Use upsertRecords for integrated inference index - Pinecone auto-embeds
    await pineconeIndex.namespace(namespace).upsertRecords([
      {
        _id: messageId,
        content: messageText,
        role: role,
        timestamp: new Date().toISOString(),
        phoneNumber: phoneNumber,
      },
    ]);

    console.log(`Saved ${role} message to Pinecone namespace: ${namespace}`);
    return messageId;
  } catch (error) {
    console.error(`Error saving message to Pinecone:`, error.message);
    return null;
  }
}

// ==== HELPER: Retrieve relevant context from Pinecone (integrated inference) ====
async function retrieveContext(phoneNumber, queryText, topK = 6) {
  try {
    const namespace = getUserNamespace(phoneNumber);

    // Use searchRecords for integrated inference index - Pinecone auto-embeds query
    const results = await pineconeIndex.namespace(namespace).searchRecords({
      query: { topK, inputs: { text: queryText } },
      fields: ["content", "role", "timestamp"],
    });

    if (!results.result?.hits?.length) {
      return "";
    }

    const contextMessages = results.result.hits.map((hit) => {
      const role = hit.fields?.role || "user";
      const content = hit.fields?.content || "";
      return `${role}: ${content}`;
    });

    return contextMessages.join("\n");
  } catch (error) {
    console.error(`Error retrieving context from Pinecone:`, error.message);
    return "";
  }
}

// ==== HELPER: Call OpenRouter LLM ====
async function callOpenRouterLLM(systemPrompt, userMessage) {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "kwaipilot/kat-coder-pro:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 500,
      temperature: 0.8,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://whatsapp-bot.app",
        "X-Title": "WhatsApp AI Bot",
      },
    }
  );

  return response.data.choices[0].message.content.trim();
}

// ==================== WEBHOOK VERIFICATION ====================
app.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    return res.status(200).send(challenge);
  }
  res.status(403).send("Forbidden");
});

// ==================== MAIN WEBHOOK HANDLER ====================
app.post("/", async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message?.text?.body) return res.sendStatus(200);

    const from = message.from;
    const userText = message.text.body.trim();

    console.log(`Message from ${from}: ${userText}`);

    // Step 1: Save incoming user message to Pinecone
    await saveMessageToPinecone(from, userText, "user");

    // Step 2: Retrieve relevant context from user's Pinecone namespace
    const context = await retrieveContext(from, userText, 6);

    // Step 3: Build prompt with retrieved context
    const systemPrompt = `You are a friendly, concise WhatsApp assistant. Reply naturally and conversationally.

${
  context
    ? `Here is relevant context from past conversations with this user:\n${context}\n\nUse this context to make your reply personalized and aware of the conversation history.`
    : "This is a new conversation."
}`;

    // Step 4: Generate reply using OpenRouter LLM
    const aiReply = await callOpenRouterLLM(systemPrompt, userText);

    // Step 5: Save assistant reply to Pinecone
    await saveMessageToPinecone(from, aiReply, "assistant");

    // Step 6: Send reply via WhatsApp
    await axios.post(
      `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: aiReply },
      },
      {
        headers: { Authorization: `Bearer ${WA_TOKEN}` },
      }
    );

    console.log(`Replied: ${aiReply}`);
    res.sendStatus(200);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
    res.sendStatus(500);
  }
});

// ==================== START ====================
app.listen(PORT, () => {
  console.log(`WhatsApp + OpenRouter RAG bot LIVE on port ${PORT}`);
  console.log(`Pinecone index: ${PINECONE_INDEX}`);
});
