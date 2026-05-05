import { Module } from '@nestjs/common';
import { PROVIDER_RUNTIME_CLIENT } from '../core/llm/provider-runtime-client';
import { MockProviderRuntimeClient } from '../core/llm/mock-provider.client';
import { OllamaProviderRuntimeClient } from '../core/llm/ollama-provider.client';

@Module({
  providers: [
    MockProviderRuntimeClient,
    OllamaProviderRuntimeClient,
    {
      provide: PROVIDER_RUNTIME_CLIENT,
      inject: [MockProviderRuntimeClient, OllamaProviderRuntimeClient],
      useFactory: (
        mockProvider: MockProviderRuntimeClient,
        ollamaProvider: OllamaProviderRuntimeClient,
      ) => {
        const provider = (process.env.LLM_PROVIDER ?? 'ollama').toLowerCase();
        return provider === 'mock' ? mockProvider : ollamaProvider;
      },
    },
  ],
  exports: [PROVIDER_RUNTIME_CLIENT],
})
export class ProvidersModule {}
