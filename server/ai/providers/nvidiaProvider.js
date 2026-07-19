const OpenAI = require('openai');

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

const NVIDIA_MODELS = {
  'deepseek-ai/deepseek-v4-flash': {
    contextWindow: 1048576, supportsVision: false, supportsEmbedding: false, maxTokens: 8192,
  },
  'deepseek-ai/deepseek-v4-pro': {
    contextWindow: 1048576, supportsVision: false, supportsEmbedding: false, maxTokens: 8192,
  },
  'deepseek-ai/deepseek-r1': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'deepseek-ai/deepseek-r1-distill-llama-8b': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'deepseek-ai/deepseek-r1-distill-llama-70b': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'deepseek-ai/deepseek-r1-distill-qwen-32b': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'meta/llama-3.3-70b-instruct': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 2048,
  },
  'meta/llama-3.1-8b-instruct': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 2048,
  },
  'meta/llama-3.1-70b-instruct': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 2048,
  },
  'meta/llama-4-maverick': {
    contextWindow: 256000, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'nvidia/llama-3.1-nemotron-70b-instruct': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'nvidia/nemotron-3-super-120b-a12b': {
    contextWindow: 262000, supportsVision: false, supportsEmbedding: false, maxTokens: 8192,
  },
  'nvidia/nemotron-3-nano': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 2048,
  },
  'nvidia/llama-3.3-nemotron-super-49b-v1.5': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'nvidia/nemotron-4-340b-instruct': {
    contextWindow: 4096, supportsVision: false, supportsEmbedding: false, maxTokens: 1024,
  },
  'qwen/qwen3-coder-480b-a35b-instruct': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 8192,
  },
  'qwen/qwen-3.5': {
    contextWindow: 262000, supportsVision: false, supportsEmbedding: false, maxTokens: 8192,
  },
  'mistralai/mistral-large-3': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'mistralai/devstral-2-123b': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'minimax/minimax-m2.7-230b': {
    contextWindow: 262000, supportsVision: false, supportsEmbedding: false, maxTokens: 8192,
  },
  'google/gemma-4-31b-it': {
    contextWindow: 16000, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'google/gemma-2-2b-it': {
    contextWindow: 8192, supportsVision: false, supportsEmbedding: false, maxTokens: 2048,
  },
  'google/gemma-2-9b-it': {
    contextWindow: 8192, supportsVision: false, supportsEmbedding: false, maxTokens: 2048,
  },
  'glm-5/glm-5': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'glm-5/glm-5.2': {
    contextWindow: 256000, supportsVision: false, supportsEmbedding: false, maxTokens: 8192,
  },
  'openai/gpt-oss-120b': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'openai/gpt-oss-20b': {
    contextWindow: 128000, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'nvidia/nv-embedqa-e5-v5': {
    contextWindow: 512, supportsVision: false, supportsEmbedding: true, maxTokens: 512,
  },
  'nvidia/bge-m3': {
    contextWindow: 8192, supportsVision: false, supportsEmbedding: true, maxTokens: 8192,
  },
  'nvidia/nv-embedcode-7b-v1': {
    contextWindow: 4096, supportsVision: false, supportsEmbedding: true, maxTokens: 4096,
  },
  'bigcode/starcoder2-7b': {
    contextWindow: 16384, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'meta/codellama-13b-instruct': {
    contextWindow: 16384, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'meta/codellama-34b-instruct': {
    contextWindow: 16384, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'meta/codellama-70b-instruct': {
    contextWindow: 16384, supportsVision: false, supportsEmbedding: false, maxTokens: 4096,
  },
  'nvidia/cosmos-reason2-8b': {
    contextWindow: 32768, supportsVision: true, supportsEmbedding: false, maxTokens: 2048,
  },
  'nvidia/cosmos-transfer1-7b': {
    contextWindow: 32768, supportsVision: true, supportsEmbedding: false, maxTokens: 2048,
  },
  'nvidia/cosmos3-nano': {
    contextWindow: 16384, supportsVision: true, supportsEmbedding: false, maxTokens: 2048,
  },
  'nvidia/cosmos3-nano-reasoner': {
    contextWindow: 16384, supportsVision: true, supportsEmbedding: false, maxTokens: 2048,
  },
  'sarvamai/sarvam-m': {
    contextWindow: 8192, supportsVision: false, supportsEmbedding: false, maxTokens: 2048,
  },
  'utter-project/eurollm-9b-instruct': {
    contextWindow: 8192, supportsVision: false, supportsEmbedding: false, maxTokens: 2048,
  },
  'speakleash/bielik-11b-v2.3-instruct': {
    contextWindow: 8192, supportsVision: false, supportsEmbedding: false, maxTokens: 2048,
  },
};

// Key pool: primary key plus an optional fallback for resilience against
// account-level failures (401 invalid key / 429 account rate limit) that a
// different NVIDIA account survives. With only NVIDIA_API_KEY set, behavior
// is identical to the previous single-key implementation.
const KEY_RESET_MS = 5 * 60 * 1000;

function nvidiaKeys() {
  return [process.env.NVIDIA_API_KEY, process.env.NVIDIA_API_KEY_FALLBACK].filter(Boolean);
}

// Module-level so every NvidiaProvider instance (there's normally one)
// shares the same "primary key is dead, use fallback" knowledge.
let _activeKeyIndex = 0;
let _keyFailedAt = 0;

function _currentKeyIndex() {
  if (_activeKeyIndex > 0 && Date.now() - _keyFailedAt > KEY_RESET_MS) {
    _activeKeyIndex = 0; // periodically retry the primary key
  }
  return _activeKeyIndex;
}

function _isKeyLevelError(err) {
  const status = err?.status || err?.response?.status;
  return status === 401 || status === 429;
}

class NvidiaProvider {
  constructor(config) {
    this.name = 'nvidia';
    this.model = config.model || 'meta/llama-3.1-8b-instruct';
    this.maxTokens = config.maxTokens || 2048;
    this.temperature = config.temperature ?? 0.7;
    this._config = config;
    this._clients = {}; // one OpenAI client per key index
  }

  _getClient(keyIndex = _currentKeyIndex()) {
    const keys = nvidiaKeys();
    const idx = Math.min(keyIndex, keys.length - 1);
    if (!this._clients[idx]) {
      this._clients[idx] = new OpenAI({
        apiKey: keys[idx],
        baseURL: NVIDIA_BASE_URL,
      });
    }
    return this._clients[idx];
  }

  // Run an SDK call with the active key; on a key-level error (401/429),
  // retry once with the next key in the pool and remember the switch.
  async _withKeyFallback(fn) {
    const keys = nvidiaKeys();
    const idx = _currentKeyIndex();
    try {
      return await fn(this._getClient(idx));
    } catch (err) {
      const nextIdx = idx + 1;
      if (!_isKeyLevelError(err) || nextIdx >= keys.length) throw err;
      console.warn(`[nvidiaProvider] key ${idx} failed (${err.status}); switching to fallback key`);
      _activeKeyIndex = nextIdx;
      _keyFailedAt = Date.now();
      return fn(this._getClient(nextIdx));
    }
  }

  isAvailable() {
    return nvidiaKeys().length > 0;
  }

  getModelInfo(modelName) {
    return NVIDIA_MODELS[modelName] || NVIDIA_MODELS['meta/llama-3.1-8b-instruct'];
  }

  async complete({ messages, system, maxTokens, temperature, responseFormat, model }) {
    const start = Date.now();
    const resolvedModel = model || this.model;
    const modelInfo = this.getModelInfo(resolvedModel);

    const params = {
      model: resolvedModel,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...messages,
      ],
      max_tokens: maxTokens || modelInfo.maxTokens || this.maxTokens,
      temperature: temperature ?? this.temperature,
    };
    if (responseFormat) params.response_format = responseFormat;

    const res = await this._withKeyFallback((client) => client.chat.completions.create(params));
    const text = res.choices[0].message.content.trim();
    return {
      text,
      provider: 'nvidia',
      model: resolvedModel,
      tokensUsed: res.usage?.total_tokens || 0,
      promptTokens: res.usage?.prompt_tokens || 0,
      completionTokens: res.usage?.completion_tokens || 0,
      latencyMs: Date.now() - start,
    };
  }

  // Real token-by-token streaming via NVIDIA NIM's OpenAI-compatible
  // chat/completions endpoint. `signal` is passed as the SDK's request-options
  // arg so an aborted Express request genuinely cancels the upstream call,
  // not just the client-side read.
  async *completeStream({ messages, system, maxTokens, temperature, model, signal }) {
    const resolvedModel = model || this.model;
    const modelInfo = this.getModelInfo(resolvedModel);

    const params = {
      model: resolvedModel,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...messages,
      ],
      max_tokens: maxTokens || modelInfo.maxTokens || this.maxTokens,
      temperature: temperature ?? this.temperature,
      stream: true,
    };

    const stream = await this._withKeyFallback((client) => client.chat.completions.create(params, { signal }));
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) yield delta;
    }
  }

  async generateEmbeddings(inputs, model) {
    const embedModel = model || 'nvidia/nv-embedqa-e5-v5';
    const inputsArr = Array.isArray(inputs) ? inputs : [inputs];
    const res = await this._withKeyFallback((client) => client.embeddings.create({
      model: embedModel,
      input: inputsArr,
    }));
    return res.data.map((d) => d.embedding);
  }

  async generate({ system, user, context, query, taskName, intent, userId, model }) {
    const messages = [
      ...(context ? [{ role: 'system', content: context }] : []),
      ...(system ? [{ role: 'system', content: system }] : []),
      ...(user ? [{ role: 'user', content: user }] : []),
      ...(query ? [{ role: 'user', content: query }] : []),
    ];
    return this.complete({ messages, system, model });
  }
}

module.exports = NvidiaProvider;
