import { OllamaProviderRuntimeClient } from './ollama-provider.client';

describe('OllamaProviderRuntimeClient', () => {
  const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
  let provider: OllamaProviderRuntimeClient;
  const previousFetch = global.fetch;
  const previousProvider = process.env.LLM_PROVIDER;
  const previousBaseUrl = process.env.OLLAMA_BASE_URL;
  const previousModel = process.env.OLLAMA_MODEL;

  beforeEach(() => {
    global.fetch = fetchMock;
    provider = new OllamaProviderRuntimeClient();
    process.env.LLM_PROVIDER = 'ollama';
    process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
    process.env.OLLAMA_MODEL = 'qwen2.5:7b-instruct';
  });

  afterEach(() => {
    fetchMock.mockReset();
    if (previousFetch) {
      global.fetch = previousFetch;
    }
    process.env.LLM_PROVIDER = previousProvider;
    process.env.OLLAMA_BASE_URL = previousBaseUrl;
    process.env.OLLAMA_MODEL = previousModel;
  });

  it('maps ollama tool call to runtime tool call', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          message: {
            content: '',
            tool_calls: [
              {
                function: {
                  name: 'TaskCreate',
                  arguments: '{"title":"from ollama"}',
                },
              },
            ],
          },
        }),
    } as Response);

    const result = await provider.run({
      systemPrompt: 'system',
      allowedTools: ['TaskCreate'],
      messages: [{ role: 'user', content: 'create task' }],
    });

    expect(result.assistantMessage).toBe('Tool call requested');
    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls[0]?.name).toBe('TaskCreate');
    expect(result.toolCalls[0]?.input).toEqual({ title: 'from ollama' });
  });
});
