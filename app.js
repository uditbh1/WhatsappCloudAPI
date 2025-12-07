// index.js — WhatsApp + OpenRouter AI Bot (Render-ready)
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json({ limit: "10mb" }));

// ==== CONFIG FROM ENV (Render will read these) ====
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WA_TOKEN = process.env.WA_TOKEN;
const PHONE_ID = process.env.PHONE_ID;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY; // ← your OpenRouter API key

// Session store
const sessions = new Map();

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

    // Get conversation history
    let history = sessions.get(from) || [
      {
        role: "system",
        content:
          "You are a friendly, concise WhatsApp assistant. Reply naturally.",
      },
    ];
    history.push({ role: "user", content: userText });

    // Call OpenRouter (supports 50+ models — change model name anytime)
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "anthropic/claude-3.5-sonnet", // ← best free model right now
        // model: "google/gemini-flash-1.5",      // ← also free & fast
        // model: "meta-llama/llama-3.1-70b",      // ← very strong
        messages: history,
        temperature: 0.8,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "HTTP-Referer": "https://your-github-or-resume.com", // optional but recommended
          "X-Title": "WhatsApp AI Bot", // optional
        },
      }
    );

    const aiReply = response.data.choices[0].message.content.trim();

    // Save assistant message
    history.push({ role: "assistant", content: aiReply });
    if (history.length > 20) history = history.slice(-20);
    sessions.set(from, history);

    // Send reply via WhatsApp
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
  console.log(
    `WhatsApp + OpenRouter bot LIVE at https://your-app.onrender.com`
  );
});
