import { ILLMProvider, ILLMConfig } from './llm.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { GroqProvider } from './providers/groq.provider';
import { config } from '../../config';

export type LLMProviderType = 'gemini' | 'ollama' | 'groq';

export class LLMFactory {
  /**
   * Creates an instance of ILLMProvider based on the provider type.
   */
  static createProvider(providerType?: string, modelName?: string, providerConfig?: ILLMConfig): ILLMProvider {
    const type = providerType || config.DEFAULT_MODEL_PROVIDER;

    switch (type.toLowerCase()) {
      case 'gemini':
        return new GeminiProvider(modelName, providerConfig);
      case 'ollama':
        return new OllamaProvider(modelName, providerConfig);
      case 'groq':
        return new GroqProvider(modelName, providerConfig);
      default:
        console.warn(`[LLM Factory] Provider '${type}' is not recognized, falling back to default.`);
        return new GeminiProvider(modelName, providerConfig);
    }
  }
}

