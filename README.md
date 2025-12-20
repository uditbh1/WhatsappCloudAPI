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
