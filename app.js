// app.js — WhatsApp + OpenRouter AI Bot with RAG (Pinecone + LangChain)
const express = require("express");
const axios = require("axios");
const { ChatOpenAI } = require("@langchain/openai");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { PineconeStore } = require("@langchain/pinecone");
const { Pinecone } = require("@pinecone-database/pinecone");
const { Document } = require("@langchain/core/documents");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
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
const PINECONE_INDEX = process.env.PINECONE_INDEX;

// Validate required environment variables
if (
  !VERIFY_TOKEN ||
  !WA_TOKEN ||
  !PHONE_ID ||
  !OPENROUTER_KEY ||
  !PINECONE_API_KEY ||
  !PINECONE_INDEX
) {
  console.error("Missing required environment variables!");
  process.exit(1);
}

// ==== INITIALIZE PINECONE ====
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(PINECONE_INDEX);

// ==== INITIALIZE EMBEDDINGS (OpenRouter) ====
const embeddings = new OpenAIEmbeddings({
  model: "nomic-ai/nomic-embed-text-v1.5",
  apiKey: OPENROUTER_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
});

// ==== INITIALIZE LLM (OpenRouter - Claude 3.5 Sonnet) ====
const llm = new ChatOpenAI(
  {
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.8,
    maxTokens: 500,
    apiKey: OPENROUTER_KEY,
  },
  {
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://your-github-or-resume.com", // Optional
      "X-Title": "WhatsApp AI Bot", // Optional
    },
  }
);

// ==== HELPER: Get user's Pinecone namespace ====
function getUserNamespace(phoneNumber) {
  return `user_${phoneNumber}`;
}

// ==== HELPER: Save message to Pinecone ====
async function saveMessageToPinecone(phoneNumber, messageText, role = "user") {
  try {
    const namespace = getUserNamespace(phoneNumber);
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace,
    });

    // Create document with message text and metadata
    const doc = new Document({
      pageContent: messageText,
      metadata: {
        role,
        timestamp: new Date().toISOString(),
        phoneNumber,
      },
    });

    // Generate unique ID for this message (timestamp-based)
    const messageId = `${role}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Add document to vector store
    await vectorStore.addDocuments([doc], { ids: [messageId] });

    console.log(`Saved ${role} message to Pinecone namespace: ${namespace}`);
    return messageId;
  } catch (error) {
    console.error(`Error saving message to Pinecone:`, error.message);
    // Don't throw - allow conversation to continue even if save fails
    return null;
  }
}

// ==== HELPER: Retrieve relevant context from Pinecone ====
async function retrieveContext(phoneNumber, queryText, topK = 6) {
  try {
    const namespace = getUserNamespace(phoneNumber);
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace,
    });

    // Retrieve top K most relevant messages
    const results = await vectorStore.similaritySearch(queryText, topK);

    // Format retrieved messages for context
    const contextMessages = results.map((doc) => {
      const role = doc.metadata?.role || "user";
      return `${role}: ${doc.pageContent}`;
    });

    return contextMessages.join("\n");
  } catch (error) {
    console.error(`Error retrieving context from Pinecone:`, error.message);
    // Return empty context if retrieval fails
    return "";
  }
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

    // Step 4: Generate reply using LLM with context
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userText),
    ];

    const response = await llm.invoke(messages);
    const aiReply = response.content.trim();

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
