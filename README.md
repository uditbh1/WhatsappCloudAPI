# WhatsApp Cloud API Bot with RAG (Retrieval-Augmented Generation)

An intelligent WhatsApp bot that uses OpenAI-compatible LLMs via OpenRouter, integrated with Pinecone vector database for conversation memory and context-aware responses. This bot implements RAG (Retrieval-Augmented Generation) to provide personalized, context-aware responses based on past conversations with each user.

## 🌟 Features

- **WhatsApp Cloud API Integration**: Seamless integration with WhatsApp Business Platform
- **AI-Powered Responses**: Uses OpenRouter to access multiple LLM models (currently configured for `kwaipilot/kat-coder-pro:free`)
- **Conversation Memory**: Stores all messages in Pinecone vector database with integrated inference
- **Per-User Context**: Each user gets their own namespace in Pinecone, enabling personalized conversations
- **RAG Implementation**: Retrieves relevant past messages to provide context-aware responses
- **Auto-Embedding**: Leverages Pinecone's integrated inference for automatic text embedding

## 🏗️ Architecture

```
WhatsApp Message → Express Webhook → Save to Pinecone → Retrieve Context → OpenRouter LLM → Save Response → Send Reply
```

### How It Works

1. **Message Reception**: WhatsApp sends incoming messages to the Express webhook
2. **Storage**: User message is saved to Pinecone in a user-specific namespace
3. **Context Retrieval**: Relevant past messages are retrieved using semantic search (top 6 most relevant)
4. **Response Generation**: LLM generates a response using the retrieved context and current message
5. **Response Storage**: Assistant's reply is saved to Pinecone for future context
6. **Message Delivery**: Response is sent back to the user via WhatsApp Cloud API

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v14 or higher)
- **WhatsApp Business Account** with access to WhatsApp Cloud API
- **Pinecone Account** with an index configured for integrated inference
- **OpenRouter Account** with API key
- **ngrok** or similar tool for local webhook testing (optional, for development)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd whatsappcloudapi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000

# WhatsApp Cloud API Configuration
VERIFY_TOKEN=your_webhook_verify_token
WA_TOKEN=your_whatsapp_access_token
PHONE_ID=your_phone_number_id

# OpenRouter Configuration
OPENROUTER_KEY=your_openrouter_api_key

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=whatsapp-memory-v2
PINECONE_HOST=your-pinecone-index-host.svc.aped-4627-b74a.pinecone.io
```

### 4. Pinecone Index Setup

Ensure your Pinecone index is configured with:

- **Integrated Inference**: The index must use Pinecone's integrated inference feature
- **Field Mapping**: The index should map to a field named `content` (as specified in the code)
- **Embedding Model**: Configured to automatically generate embeddings from text

### 5. Start the Server

```bash
node app.js
```

The server will start on the port specified in your `.env` file (default: 3000).

## 🔧 Configuration

### WhatsApp Cloud API Setup

1. **Create a Meta App**:

   - Go to [Meta for Developers](https://developers.facebook.com/)
   - Create a new app and select "Business" type
   - Add WhatsApp product to your app

2. **Configure Webhook**:

   - Set your webhook URL (e.g., `https://your-domain.com/`)
   - Set the verify token (must match `VERIFY_TOKEN` in `.env`)
   - Subscribe to `messages` webhook field

3. **Get Credentials**:
   - **Access Token**: Found in WhatsApp > API Setup
   - **Phone Number ID**: Found in WhatsApp > API Setup

### OpenRouter Configuration

1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Generate an API key
3. Add credits to your account
4. Optionally configure model preferences (default: `kwaipilot/kat-coder-pro:free`)

### Pinecone Configuration

1. Sign up at [Pinecone](https://www.pinecone.io/)
2. Create an index with integrated inference enabled
3. Configure the index to use a field named `content` for text embedding
4. Get your API key and index host from the Pinecone dashboard

## 📖 API Endpoints

### GET `/`

Webhook verification endpoint for WhatsApp Cloud API.

**Query Parameters:**

- `hub.mode`: Must be "subscribe"
- `hub.verify_token`: Must match `VERIFY_TOKEN`
- `hub.challenge`: Challenge string from WhatsApp

**Response**: Returns the challenge string if verification succeeds (200), otherwise 403.

### POST `/`

Main webhook handler for incoming WhatsApp messages.

**Request Body**: WhatsApp webhook payload (automatically handled)

**Response**: HTTP 200 on success, HTTP 500 on error

## 🔍 Code Structure

```12:197:app.js
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
const PINECONE_HOST =
  process.env.PINECONE_HOST ||
  "whatsapp-memory-v2-b9h2kcy.svc.aped-4627-b74a.pinecone.io";

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
// Use host directly for integrated inference index
const pineconeIndex = pinecone.index(PINECONE_INDEX, PINECONE_HOST);

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
    // Use 'id' (not '_id') and 'content' field matches the index fieldMap
    await pineconeIndex.namespace(namespace).upsertRecords([
      {
        id: messageId,
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
```

## 🔑 Key Functions

### `getUserNamespace(phoneNumber)`

Creates a unique namespace for each user based on their phone number.

### `saveMessageToPinecone(phoneNumber, messageText, role)`

Saves messages to Pinecone with automatic embedding using integrated inference.

### `retrieveContext(phoneNumber, queryText, topK)`

Retrieves the most relevant past messages using semantic search.

### `callOpenRouterLLM(systemPrompt, userMessage)`

Generates AI responses using OpenRouter's LLM API.

## 🧪 Testing Locally

For local development, use ngrok to expose your local server:

```bash
# Install ngrok (if not already installed)
# Download from https://ngrok.com/

# Start your server
node app.js

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok URL as your webhook URL in Meta Developer Console
```

## 📦 Dependencies

- **express**: Web framework for Node.js
- **axios**: HTTP client for API requests
- **@pinecone-database/pinecone**: Official Pinecone SDK
- **dotenv**: Environment variable management

## 🔒 Security Considerations

- Store all sensitive keys in environment variables (never commit to git)
- Use HTTPS for production webhooks
- Implement rate limiting for production use
- Validate and sanitize incoming webhook data
- Monitor API usage to prevent abuse

## 🐛 Troubleshooting

### Webhook Verification Fails

- Ensure `VERIFY_TOKEN` matches exactly in both `.env` and Meta Developer Console
- Check that the webhook URL is accessible and returns the challenge

### Pinecone Errors

- Verify your API key is correct
- Ensure the index exists and has integrated inference enabled
- Check that the field mapping matches (`content` field)

### OpenRouter Errors

- Verify your API key and account balance
- Check model availability and rate limits
- Ensure proper headers are sent with requests

### WhatsApp Messages Not Received

- Verify webhook is subscribed to `messages` field
- Check phone number ID and access token
- Ensure your Meta app has WhatsApp product enabled

## 🚀 Deployment

### Recommended Platforms

- **Heroku**: Easy deployment with environment variables support
- **Render**: Free tier available, simple configuration
- **Railway**: Modern platform with automatic deployments
- **AWS/GCP/Azure**: For enterprise deployments

### Deployment Checklist

- [ ] Set all environment variables in your hosting platform
- [ ] Ensure webhook URL uses HTTPS
- [ ] Configure webhook in Meta Developer Console
- [ ] Test webhook verification
- [ ] Monitor logs for errors
- [ ] Set up error alerting

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📚 Resources

- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Express.js Documentation](https://expressjs.com/)

## ⚠️ Important Notes

- This bot uses Pinecone's integrated inference feature, which automatically handles embeddings
- Each user gets their own namespace in Pinecone (`user_<phone_number>`)
- Messages are stored with metadata including role (user/assistant), timestamp, and phone number
- The system retrieves top 6 most relevant past messages for context
- Currently configured for the `kwaipilot/kat-coder-pro:free` model via OpenRouter

## 🔄 Future Enhancements

Potential improvements for this project:

- Support for media messages (images, videos, documents)
- Multi-language support
- Admin commands (clear history, statistics)
- Rate limiting per user
- Conversation export functionality
- Analytics dashboard
- Support for group chats

---

Made with ❤️ for building intelligent WhatsApp bots
