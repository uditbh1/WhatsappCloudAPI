---
title: Embeddings
subtitle: Generate vector embeddings from text
headline: Embeddings API | Convert Text to Vector Representations with OpenRouter
canonical-url: "https://openrouter.ai/docs/api/reference/embeddings"
"og:site_name": OpenRouter Documentation
"og:title": Embeddings API - Generate Vector Embeddings from Text
"og:description": >-
  Generate vector embeddings from text using OpenRouter's unified embeddings
  API. Access multiple embedding models from different providers with a single
  interface.
"og:image":
  type: url
  value: >-
    https://openrouter.ai/dynamic-og?title=Embeddings%20API&description=Generate%20Vector%20Embeddings%20from%20Text
"og:image:width": 1200
"og:image:height": 630
"twitter:card": summary_large_image
"twitter:site": "@OpenRouterAI"
noindex: false
nofollow: false
---

import { API_KEY_REF } from '../../../imports/constants';

Embeddings are numerical representations of text that capture semantic meaning. They convert text into vectors (arrays of numbers) that can be used for various machine learning tasks. OpenRouter provides a unified API to access embedding models from multiple providers.

## What are Embeddings?

Embeddings transform text into high-dimensional vectors where semantically similar texts are positioned closer together in vector space. For example, "cat" and "kitten" would have similar embeddings, while "cat" and "airplane" would be far apart.

These vector representations enable machines to understand relationships between pieces of text, making them essential for many AI applications.

## Common Use Cases

Embeddings are used in a wide variety of applications:

**RAG (Retrieval-Augmented Generation)**: Build RAG systems that retrieve relevant context from a knowledge base before generating answers. Embeddings help find the most relevant documents to include in the LLM's context.

**Semantic Search**: Convert documents and queries into embeddings, then find the most relevant documents by comparing vector similarity. This provides more accurate results than traditional keyword matching because it understands meaning rather than just matching words.

**Recommendation Systems**: Generate embeddings for items (products, articles, movies) and user preferences to recommend similar items. By comparing embedding vectors, you can find items that are semantically related even if they don't share obvious keywords.

**Clustering and Classification**: Group similar documents together or classify text into categories by analyzing embedding patterns. Documents with similar embeddings likely belong to the same topic or category.

**Duplicate Detection**: Identify duplicate or near-duplicate content by comparing embedding similarity. This works even when text is paraphrased or reworded.

**Anomaly Detection**: Detect unusual or outlier content by identifying embeddings that are far from typical patterns in your dataset.

## How to Use Embeddings

### Basic Request

To generate embeddings, send a POST request to `/embeddings` with your text input and chosen model:

<Template data={{
  API_KEY_REF,
  MODEL: 'openai/text-embedding-3-small'
}}>
<CodeGroup>

```typescript title="TypeScript SDK"
import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter({
  apiKey: "{{API_KEY_REF}}",
});

const response = await openRouter.embeddings.generate({
  model: "{{MODEL}}",
  input: "The quick brown fox jumps over the lazy dog",
});

console.log(response.data[0].embedding);
```

```python title="Python"
import requests

response = requests.post(
  "https://openrouter.ai/api/v1/embeddings",
  headers={
    "Authorization": f"Bearer {{API_KEY_REF}}",
    "Content-Type": "application/json",
  },
  json={
    "model": "{{MODEL}}",
    "input": "The quick brown fox jumps over the lazy dog"
  }
)

data = response.json()
embedding = data["data"][0]["embedding"]
print(f"Embedding dimension: {len(embedding)}")
```

```typescript title="TypeScript (fetch)"
const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
  method: "POST",
  headers: {
    Authorization: "Bearer {{API_KEY_REF}}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "{{MODEL}}",
    input: "The quick brown fox jumps over the lazy dog",
  }),
});

const data = await response.json();
const embedding = data.data[0].embedding;
console.log(`Embedding dimension: ${embedding.length}`);
```

```shell title="Shell"
curl https://openrouter.ai/api/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
    "model": "{{MODEL}}",
    "input": "The quick brown fox jumps over the lazy dog"
  }'
```

</CodeGroup>
</Template>

### Batch Processing

You can generate embeddings for multiple texts in a single request by passing an array of strings:

<Template data={{
  API_KEY_REF,
  MODEL: 'openai/text-embedding-3-small'
}}>
<CodeGroup>

```typescript title="TypeScript SDK"
import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter({
  apiKey: "{{API_KEY_REF}}",
});

const response = await openRouter.embeddings.generate({
  model: "{{MODEL}}",
  input: [
    "Machine learning is a subset of artificial intelligence",
    "Deep learning uses neural networks with multiple layers",
    "Natural language processing enables computers to understand text",
  ],
});

// Process each embedding
response.data.forEach((item, index) => {
  console.log(`Embedding ${index}: ${item.embedding.length} dimensions`);
});
```

```python title="Python"
import requests

response = requests.post(
  "https://openrouter.ai/api/v1/embeddings",
  headers={
    "Authorization": f"Bearer {{API_KEY_REF}}",
    "Content-Type": "application/json",
  },
  json={
    "model": "{{MODEL}}",
    "input": [
      "Machine learning is a subset of artificial intelligence",
      "Deep learning uses neural networks with multiple layers",
      "Natural language processing enables computers to understand text"
    ]
  }
)

data = response.json()
for i, item in enumerate(data["data"]):
  print(f"Embedding {i}: {len(item['embedding'])} dimensions")
```

```typescript title="TypeScript (fetch)"
const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
  method: "POST",
  headers: {
    Authorization: "Bearer {{API_KEY_REF}}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "{{MODEL}}",
    input: [
      "Machine learning is a subset of artificial intelligence",
      "Deep learning uses neural networks with multiple layers",
      "Natural language processing enables computers to understand text",
    ],
  }),
});

const data = await response.json();
data.data.forEach((item, index) => {
  console.log(`Embedding ${index}: ${item.embedding.length} dimensions`);
});
```

```shell title="Shell"
curl https://openrouter.ai/api/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
    "model": "{{MODEL}}",
    "input": [
      "Machine learning is a subset of artificial intelligence",
      "Deep learning uses neural networks with multiple layers",
      "Natural language processing enables computers to understand text"
    ]
  }'
```

</CodeGroup>
</Template>

## API Reference

For detailed information about request parameters, response format, and all available options, see the [Embeddings API Reference](/docs/api-reference/embeddings/create-embeddings).

## Available Models

OpenRouter provides access to various embedding models from different providers. You can view all available embedding models at:

[https://openrouter.ai/models?fmt=cards&output_modalities=embeddings](https://openrouter.ai/models?fmt=cards&output_modalities=embeddings)

To list all available embedding models programmatically:

<Template data={{
  API_KEY_REF
}}>
<CodeGroup>

```typescript title="TypeScript SDK"
import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter({
  apiKey: "{{API_KEY_REF}}",
});

const models = await openRouter.embeddings.listModels();
console.log(models.data);
```

```python title="Python"
import requests

response = requests.get(
  "https://openrouter.ai/api/v1/embeddings/models",
  headers={
    "Authorization": f"Bearer {{API_KEY_REF}}",
  }
)

models = response.json()
for model in models["data"]:
  print(f"{model['id']}: {model.get('context_length', 'N/A')} tokens")
```

```typescript title="TypeScript (fetch)"
const response = await fetch("https://openrouter.ai/api/v1/embeddings/models", {
  headers: {
    Authorization: "Bearer {{API_KEY_REF}}",
  },
});

const models = await response.json();
console.log(models.data);
```

```shell title="Shell"
curl https://openrouter.ai/api/v1/embeddings/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

</CodeGroup>
</Template>

## Practical Example: Semantic Search

Here's a complete example of building a semantic search system using embeddings:

<Template data={{
  API_KEY_REF,
  MODEL: 'openai/text-embedding-3-small'
}}>
<CodeGroup>

```typescript title="TypeScript SDK"
import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter({
  apiKey: "{{API_KEY_REF}}",
});

// Sample documents
const documents = [
  "The cat sat on the mat",
  "Dogs are loyal companions",
  "Python is a programming language",
  "Machine learning models require training data",
  "The weather is sunny today",
];

// Function to calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function semanticSearch(query: string, documents: string[]) {
  // Generate embeddings for all documents and the query
  const response = await openRouter.embeddings.generate({
    model: "{{MODEL}}",
    input: [query, ...documents],
  });

  const queryEmbedding = response.data[0].embedding;
  const docEmbeddings = response.data.slice(1);

  // Calculate similarity scores
  const results = documents.map((doc, i) => ({
    document: doc,
    similarity: cosineSimilarity(
      queryEmbedding as number[],
      docEmbeddings[i].embedding as number[]
    ),
  }));

  // Sort by similarity (highest first)
  results.sort((a, b) => b.similarity - a.similarity);

  return results;
}

// Search for documents related to pets
const results = await semanticSearch("pets and animals", documents);
console.log("Search results:");
results.forEach((result, i) => {
  console.log(
    `${i + 1}. ${result.document} (similarity: ${result.similarity.toFixed(4)})`
  );
});
```

```python title="Python"
import requests
import numpy as np

OPENROUTER_API_KEY = "{{API_KEY_REF}}"

# Sample documents
documents = [
  "The cat sat on the mat",
  "Dogs are loyal companions",
  "Python is a programming language",
  "Machine learning models require training data",
  "The weather is sunny today"
]

def cosine_similarity(a, b):
  """Calculate cosine similarity between two vectors"""
  dot_product = np.dot(a, b)
  magnitude_a = np.linalg.norm(a)
  magnitude_b = np.linalg.norm(b)
  return dot_product / (magnitude_a * magnitude_b)

def semantic_search(query, documents):
  """Perform semantic search using embeddings"""
  # Generate embeddings for query and all documents
  response = requests.post(
    "https://openrouter.ai/api/v1/embeddings",
    headers={
      "Authorization": f"Bearer {OPENROUTER_API_KEY}",
      "Content-Type": "application/json",
    },
    json={
      "model": "{{MODEL}}",
      "input": [query] + documents
    }
  )

  data = response.json()
  query_embedding = np.array(data["data"][0]["embedding"])
  doc_embeddings = [np.array(item["embedding"]) for item in data["data"][1:]]

  # Calculate similarity scores
  results = []
  for i, doc in enumerate(documents):
    similarity = cosine_similarity(query_embedding, doc_embeddings[i])
    results.append({"document": doc, "similarity": similarity})

  # Sort by similarity (highest first)
  results.sort(key=lambda x: x["similarity"], reverse=True)

  return results

# Search for documents related to pets
results = semantic_search("pets and animals", documents)
print("Search results:")
for i, result in enumerate(results):
  print(f"{i + 1}. {result['document']} (similarity: {result['similarity']:.4f})")
```

</CodeGroup>
</Template>

Expected output:

```
Search results:
1. Dogs are loyal companions (similarity: 0.8234)
2. The cat sat on the mat (similarity: 0.7891)
3. The weather is sunny today (similarity: 0.3456)
4. Machine learning models require training data (similarity: 0.2987)
5. Python is a programming language (similarity: 0.2654)
```

## Best Practices

**Choose the Right Model**: Different embedding models have different strengths. Smaller models (like qwen/qwen3-embedding-0.6b or openai/text-embedding-3-small) are faster and cheaper, while larger models (like openai/text-embedding-3-large) provide better quality. Test multiple models to find the best fit for your use case.

**Batch Your Requests**: When processing multiple texts, send them in a single request rather than making individual API calls. This reduces latency and costs.

**Cache Embeddings**: Embeddings for the same text are deterministic (they don't change). Store embeddings in a database or vector store to avoid regenerating them repeatedly.

**Normalize for Comparison**: When comparing embeddings, use cosine similarity rather than Euclidean distance. Cosine similarity is scale-invariant and works better for high-dimensional vectors.

**Consider Context Length**: Each model has a maximum input length (context window). Longer texts may need to be chunked or truncated. Check the model's specifications before processing long documents.

**Use Appropriate Chunking**: For long documents, split them into meaningful chunks (paragraphs, sections) rather than arbitrary character limits. This preserves semantic coherence.

## Provider Routing

You can control which providers serve your embedding requests using the `provider` parameter. This is useful for:

- Ensuring data privacy with specific providers
- Optimizing for cost or latency
- Using provider-specific features

Example with provider preferences:

```typescript
{
  "model": "openai/text-embedding-3-small",
  "input": "Your text here",
  "provider": {
    "order": ["openai", "azure"],
    "allow_fallbacks": true,
    "data_collection": "deny"
  }
}
```

For more information, see [Provider Routing](/docs/features/provider-routing).

## Error Handling

Common errors you may encounter:

**400 Bad Request**: Invalid input format or missing required parameters. Check that your `input` and `model` parameters are correctly formatted.

**401 Unauthorized**: Invalid or missing API key. Verify your API key is correct and included in the Authorization header.

**402 Payment Required**: Insufficient credits. Add credits to your OpenRouter account.

**404 Not Found**: The specified model doesn't exist or isn't available for embeddings. Check the model name and verify it's an embedding model.

**429 Too Many Requests**: Rate limit exceeded. Implement exponential backoff and retry logic.

**529 Provider Overloaded**: The provider is temporarily overloaded. Enable `allow_fallbacks: true` to automatically use backup providers.

## Limitations

- **No Streaming**: Unlike chat completions, embeddings are returned as complete responses. Streaming is not supported.
- **Token Limits**: Each model has a maximum input length. Texts exceeding this limit will be truncated or rejected.
- **Deterministic Output**: Embeddings for the same input text will always be identical (no temperature or randomness).
- **Language Support**: Some models are optimized for specific languages. Check model documentation for language capabilities.

## Related Resources

- [Models Page](https://openrouter.ai/models?fmt=cards&output_modalities=embeddings) - Browse all available embedding models
- [Provider Routing](/docs/features/provider-routing) - Control which providers serve your requests
- [Authentication](/docs/api/authentication) - Learn about API key authentication
- [Errors](/docs/api/errors) - Detailed error codes and handling

# PineconeStore

[Pinecone](https://www.pinecone.io/) is a vector database that helps power AI for some of the world’s best companies.

This guide provides a quick overview for getting started with Pinecone [vector stores](/oss/javascript/integrations/vectorstores). For detailed documentation of all `PineconeStore` features and configurations head to the [API reference](https://api.js.langchain.com/classes/langchain_pinecone.PineconeStore.html).

## Overview

### Integration details

| Class                                                                                         | Package                                                        | [PY support](https://python.langchain.com/docs/integrations/vectorstores/pinecone/) |                                             Version                                             |
| :-------------------------------------------------------------------------------------------- | :------------------------------------------------------------- | :---------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------: |
| [`PineconeStore`](https://api.js.langchain.com/classes/langchain_pinecone.PineconeStore.html) | [`@langchain/pinecone`](https://npmjs.com/@langchain/pinecone) |                                         ✅                                          | ![NPM - Version](https://img.shields.io/npm/v/@langchain/pinecone?style=flat-square&label=%20&) |

## Setup

To use Pinecone vector stores, you'll need to create a Pinecone account, initialize an index, and install the `@langchain/pinecone` integration package. You'll also want to install the [official Pinecone SDK](https://www.npmjs.com/package/@pinecone-database/pinecone) to initialize a client to pass into the `PineconeStore` instance.

This guide will also use [OpenAI embeddings](/oss/javascript/integrations/text_embedding/openai), which require you to install the `@langchain/openai` integration package. You can also use [other supported embeddings models](/oss/javascript/integrations/text_embedding) if you wish.

<CodeGroup>
  ```bash npm theme={null}
  npm install @langchain/pinecone @langchain/openai @langchain/core @pinecone-database/pinecone@5
  ```

```bash yarn theme={null}
yarn add @langchain/pinecone @langchain/openai @langchain/core @pinecone-database/pinecone@5
```

```bash pnpm theme={null}
pnpm add @langchain/pinecone @langchain/openai @langchain/core @pinecone-database/pinecone@5
```

</CodeGroup>

### Credentials

Sign up for a [Pinecone](https://www.pinecone.io/) account and create an index. Make sure the dimensions match those of the embeddings you want to use (the default is 1536 for OpenAI's `text-embedding-3-small`). Once you've done this set the `PINECONE_INDEX`, `PINECONE_API_KEY`, and (optionally) `PINECONE_ENVIRONMENT` environment variables:

```typescript theme={null}
process.env.PINECONE_API_KEY = "your-pinecone-api-key";
process.env.PINECONE_INDEX = "your-pinecone-index";

// Optional
process.env.PINECONE_ENVIRONMENT = "your-pinecone-environment";
```

If you are using OpenAI embeddings for this guide, you'll need to set your OpenAI key as well:

```typescript theme={null}
process.env.OPENAI_API_KEY = "YOUR_API_KEY";
```

If you want to get automated tracing of your model calls you can also set your [LangSmith](https://docs.langchain.com/langsmith/home) API key by uncommenting below:

```typescript theme={null}
// process.env.LANGSMITH_TRACING="true"
// process.env.LANGSMITH_API_KEY="your-api-key"
```

## Instantiation

```typescript theme={null}
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const pinecone = new PineconeClient();
// Will automatically read the PINECONE_API_KEY and PINECONE_ENVIRONMENT env vars
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
  // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
  maxConcurrency: 5,
  // You can pass a namespace here too
  // namespace: "foo",
});
```

## Manage vector store

### Add items to vector store

```typescript theme={null}
import type { Document } from "@langchain/core/documents";

const document1: Document = {
  pageContent: "The powerhouse of the cell is the mitochondria",
  metadata: { source: "https://example.com" },
};

const document2: Document = {
  pageContent: "Buildings are made out of brick",
  metadata: { source: "https://example.com" },
};

const document3: Document = {
  pageContent: "Mitochondria are made out of lipids",
  metadata: { source: "https://example.com" },
};

const document4: Document = {
  pageContent: "The 2024 Olympics are in Paris",
  metadata: { source: "https://example.com" },
};

const documents = [document1, document2, document3, document4];

await vectorStore.addDocuments(documents, { ids: ["1", "2", "3", "4"] });
```

```python theme={null}
[ '1', '2', '3', '4' ]
```

**Note:** After adding documents, there is a slight delay before they become queryable.

### Delete items from vector store

```typescript theme={null}
await vectorStore.delete({ ids: ["4"] });
```

## Query vector store

Once your vector store has been created and the relevant documents have been added you will most likely wish to query it during the running of your chain or agent.

### Query directly

Performing a simple similarity search can be done as follows:

```typescript theme={null}
// Optional filter
const filter = { source: "https://example.com" };

const similaritySearchResults = await vectorStore.similaritySearch(
  "biology",
  2,
  filter
);

for (const doc of similaritySearchResults) {
  console.log(`* ${doc.pageContent} [${JSON.stringify(doc.metadata, null)}]`);
}
```

```text theme={null}
* The powerhouse of the cell is the mitochondria [{"source":"https://example.com"}]
* Mitochondria are made out of lipids [{"source":"https://example.com"}]
```

If you want to execute a similarity search and receive the corresponding scores you can run:

```typescript theme={null}
const similaritySearchWithScoreResults =
  await vectorStore.similaritySearchWithScore("biology", 2, filter);

for (const [doc, score] of similaritySearchWithScoreResults) {
  console.log(
    `* [SIM=${score.toFixed(3)}] ${doc.pageContent} [${JSON.stringify(
      doc.metadata
    )}]`
  );
}
```

```text theme={null}
* [SIM=0.165] The powerhouse of the cell is the mitochondria [{"source":"https://example.com"}]
* [SIM=0.148] Mitochondria are made out of lipids [{"source":"https://example.com"}]
```

### Query by turning into retriever

You can also transform the vector store into a [retriever](/oss/javascript/langchain/retrieval) for easier usage in your chains.

```typescript theme={null}
const retriever = vectorStore.asRetriever({
  // Optional filter
  filter: filter,
  k: 2,
});

await retriever.invoke("biology");
```

```javascript theme={null}
[
  Document {
    pageContent: 'The powerhouse of the cell is the mitochondria',
    metadata: { source: 'https://example.com' },
    id: undefined
  },
  Document {
    pageContent: 'Mitochondria are made out of lipids',
    metadata: { source: 'https://example.com' },
    id: undefined
  }
]
```

### Usage for retrieval-augmented generation

For guides on how to use this vector store for retrieval-augmented generation (RAG), see the following sections:

- [Build a RAG app with LangChain](/oss/javascript/langchain/rag).
- [Agentic RAG](/oss/javascript/langgraph/agentic-rag)
- [Retrieval docs](/oss/javascript/langchain/retrieval)

---

## API reference

For detailed documentation of all `PineconeStore` features and configurations head to the [API reference](https://api.js.langchain.com/classes/langchain_pinecone.PineconeStore.html).

---

<Callout icon="pen-to-square" iconType="regular">
  [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/vectorstores/pinecone.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
</Callout>

<Tip icon="terminal" iconType="regular">
  [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
</Tip>

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.langchain.com/llms.txt<llms-ignore>

---

title: LangChain
subtitle: Using OpenRouter with LangChain
headline: 'LangChain Integration | OpenRouter SDK Support'
canonical-url: https://openrouter.ai/docs/guides/community/langchain
og:site_name: OpenRouter Documentation
og:title: 'LangChain Integration - OpenRouter SDK Support'
og:description: 'Integrate OpenRouter using LangChain framework. Complete guide for LangChain integration with OpenRouter for Python and JavaScript.'
og:image: https://openrouter.ai/dynamic-og?title=LangChain&description=LangChain%20Integration
og:image:width: 1200
og:image:height: 630
twitter:card: summary_large_image
twitter:site: '@OpenRouterAI'
noindex: false
nofollow: false

---

import { API_KEY_REF } from '../../../imports/constants';

## Using LangChain

LangChain provides a standard interface for working with chat models. You can use OpenRouter with LangChain by setting the `base_url` parameter to point to OpenRouter's API. For more details on LangChain's model interface, see the [LangChain Models documentation](https://docs.langchain.com/oss/python/langchain/models#initialize-a-model).

**Resources:**

- Using [LangChain for Python](https://github.com/langchain-ai/langchain): [github](https://github.com/alexanderatallah/openrouter-streamlit/blob/main/pages/2_Langchain_Quickstart.py)
- Using [LangChain.js](https://github.com/langchain-ai/langchainjs): [github](https://github.com/OpenRouterTeam/openrouter-examples/blob/main/examples/langchain/index.ts)
- Using [Streamlit](https://streamlit.io/): [github](https://github.com/alexanderatallah/openrouter-streamlit)

<CodeGroup>

```typescript title="TypeScript"
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const chat = new ChatOpenAI(
  {
    model: "<model_name>",
    temperature: 0.8,
    streaming: true,
    apiKey: "${API_KEY_REF}",
  },
  {
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
      "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
    },
  }
);

// Example usage
const response = await chat.invoke([
  new SystemMessage("You are a helpful assistant."),
  new HumanMessage("Hello, how are you?"),
]);
```

```python title="Python (using init_chat_model)"
from langchain.chat_models import init_chat_model
from os import getenv
from dotenv import load_dotenv

load_dotenv()

# Initialize the model with OpenRouter's base URL
model = init_chat_model(
    model="<model_name>",
    model_provider="openai",
    base_url="https://openrouter.ai/api/v1",
    api_key=getenv("OPENROUTER_API_KEY"),
    default_headers={
        "HTTP-Referer": getenv("YOUR_SITE_URL"),  # Optional. Site URL for rankings on openrouter.ai.
        "X-Title": getenv("YOUR_SITE_NAME"),  # Optional. Site title for rankings on openrouter.ai.
    }
)

# Example usage
response = model.invoke("What NFL team won the Super Bowl in the year Justin Bieber was born?")
print(response.content)
```

```python title="Python (using ChatOpenAI directly)"
from langchain_openai import ChatOpenAI
from os import getenv
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(
    api_key=getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
    model="<model_name>",
    default_headers={
        "HTTP-Referer": getenv("YOUR_SITE_URL"),  # Optional. Site URL for rankings on openrouter.ai.
        "X-Title": getenv("YOUR_SITE_NAME"),  # Optional. Site title for rankings on openrouter.ai.
    }
)

# Example usage
response = llm.invoke("What NFL team won the Super Bowl in the year Justin Bieber was born?")
print(response.content)
```

</CodeGroup>
</llms-ignore>
# LangChain overview

LangChain is the easiest way to start building agents and applications powered by LLMs. With under 10 lines of code, you can connect to OpenAI, Anthropic, Google, and [more](/oss/javascript/integrations/providers/overview). LangChain provides a pre-built agent architecture and model integrations to help you get started quickly and seamlessly incorporate LLMs into your agents and applications.

We recommend you use LangChain if you want to quickly build agents and autonomous applications. Use [LangGraph](/oss/javascript/langgraph/overview), our low-level agent orchestration framework and runtime, when you have more advanced needs that require a combination of deterministic and agentic workflows, heavy customization, and carefully controlled latency.

LangChain [agents](/oss/javascript/langchain/agents) are built on top of LangGraph in order to provide durable execution, streaming, human-in-the-loop, persistence, and more. You do not need to know LangGraph for basic LangChain agent usage.

## <Icon icon="wand-magic-sparkles" /> Create an agent

```ts theme={null}
import * as z from "zod";
// npm install @langchain/anthropic to call the model
import { createAgent, tool } from "langchain";

const getWeather = tool(({ city }) => `It's always sunny in ${city}!`, {
  name: "get_weather",
  description: "Get the weather for a given city",
  schema: z.object({
    city: z.string(),
  }),
});

const agent = createAgent({
  model: "claude-sonnet-4-5-20250929",
  tools: [getWeather],
});

console.log(
  await agent.invoke({
    messages: [{ role: "user", content: "What's the weather in Tokyo?" }],
  })
);
```

See the [Installation instructions](/oss/javascript/langchain/install) and [Quickstart guide](/oss/javascript/langchain/quickstart) to get started building your own agents and applications with LangChain.

## <Icon icon="star" size={20} /> Core benefits

<Columns cols={2}>
  <Card title="Standard model interface" icon="arrows-rotate" href="/oss/javascript/langchain/models" arrow cta="Learn more">
    Different providers have unique APIs for interacting with models, including the format of responses. LangChain standardizes how you interact with models so that you can seamlessly swap providers and avoid lock-in.
  </Card>

  <Card title="Easy to use, highly flexible agent" icon="wand-magic-sparkles" href="/oss/javascript/langchain/agents" arrow cta="Learn more">
    LangChain's agent abstraction is designed to be easy to get started with, letting you build a simple agent in under 10 lines of code. But it also provides enough flexibility to allow you to do all the context engineering your heart desires.
  </Card>

  <Card title="Built on top of LangGraph" icon="circle-nodes" href="/oss/javascript/langgraph/overview" arrow cta="Learn more">
    LangChain's agents are built on top of LangGraph. This allows us to take advantage of LangGraph's durable execution, human-in-the-loop support, persistence, and more.
  </Card>

  <Card title="Debug with LangSmith" icon="eye" href="/langsmith/home" arrow cta="Learn more">
    Gain deep visibility into complex agent behavior with visualization tools that trace execution paths, capture state transitions, and provide detailed runtime metrics.
  </Card>
</Columns>

---

<Callout icon="pen-to-square" iconType="regular">
  [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/overview.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
</Callout>

<Tip icon="terminal" iconType="regular">
  [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
</Tip>

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.langchain.com/llms.txt## Tech Stack & References

- WhatsApp Cloud API + Node.js/Express webhook
- OpenRouter for LLM (Claude 3.5 Sonnet) and embeddings (nomic-embed-text-v1.5)
- LangChain.js for RAG chain and retrieval
- Pinecone for long-term per-user vector memory (namespaces = phone numbers)

Key Documentation:

- LangChain.js Pinecone Vector Store: https://js.langchain.com/docs/integrations/vectorstores/pinecone/
- Pinecone + LangChain Integration: https://docs.pinecone.io/integrations/langchain
- OpenRouter + LangChain: https://openrouter.ai/docs/guides/community/langchain
- LangChain.js RAG Tutorial: https://js.langchain.com/docs/tutorials/rag
