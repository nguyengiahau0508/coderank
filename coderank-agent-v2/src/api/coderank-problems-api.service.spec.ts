import { CoderankProblemsApiService } from './coderank-problems-api.service';

describe('CoderankProblemsApiService', () => {
  const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
  let service: CoderankProblemsApiService;
  const previousFetch = global.fetch;
  const previousBaseUrl = process.env.CODERANK_API_BASE_URL;
  const previousPath = process.env.CODERANK_API_PROBLEMS_PATH;

  beforeEach(() => {
    global.fetch = fetchMock;
    service = new CoderankProblemsApiService();
    process.env.CODERANK_API_BASE_URL = 'http://127.0.0.1:3000';
    process.env.CODERANK_API_PROBLEMS_PATH = '/problems';
  });

  afterEach(() => {
    fetchMock.mockReset();
    if (previousFetch) {
      global.fetch = previousFetch;
    }
    process.env.CODERANK_API_BASE_URL = previousBaseUrl;
    process.env.CODERANK_API_PROBLEMS_PATH = previousPath;
  });

  it('posts problem payload to coderank-api', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () =>
        Promise.resolve({
          id: 'problem-1',
          title: 'Two Sum',
        }),
    } as Response);

    const result = await service.createProblem(
      {
        title: 'Two Sum',
        slug: 'two-sum',
        statement: 'Find two numbers',
        difficulty: 'easy',
      },
      'user-access-token',
    );

    const firstCall = fetchMock.mock.calls[0];
    expect(firstCall?.[0]).toBe('http://127.0.0.1:3000/problems');
    expect(firstCall?.[1]?.method).toBe('POST');

    const headers = firstCall?.[1]?.headers;
    if (
      !headers ||
      typeof headers !== 'object' ||
      !('authorization' in headers)
    ) {
      throw new Error('Authorization header missing in fetch call');
    }
    expect(headers.authorization).toBe('Bearer user-access-token');

    expect(result).toEqual({
      id: 'problem-1',
      title: 'Two Sum',
    });
  });

  it('throws when token is missing', async () => {
    await expect(
      service.createProblem({
        title: 'Two Sum',
        slug: 'two-sum',
        statement: 'Find two numbers',
        difficulty: 'easy',
      }),
    ).rejects.toThrow('Missing access token for coderank-api call');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
