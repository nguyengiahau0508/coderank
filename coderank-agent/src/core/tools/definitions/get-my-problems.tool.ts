import { z } from 'zod';
import { ITool } from '../tool.interface';

const GetMyProblemsParams = z.object({
  page: z.number().optional().describe('Page number for pagination'),
  limit: z.number().optional().describe('Maximum number of problems per page'),

  sortBy: z
    .enum(['createdAt', 'title', 'difficulty', 'points'])
    .optional()
    .describe('Field used to sort the problems'),

  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .describe('Sorting order'),

  search: z
    .string()
    .optional()
    .describe('Search keyword for problem title'),

  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .optional()
    .describe('Filter problems by difficulty level'),

  tags: z
    .array(z.string())
    .optional()
    .describe('Filter problems by tags'),

  isPublished: z
    .boolean()
    .optional()
    .describe('Filter by published or unpublished problems'),

  minPoints: z
    .number()
    .optional()
    .describe('Minimum points of the problems'),

  maxPoints: z
    .number()
    .optional()
    .describe('Maximum points of the problems'),
});

export const GetMyProblemsTool: ITool = {
  name: 'get_my_problems',
  description: 'Get a paginated list of problems created by the current authenticated user. Use this when the user asks for "my problems", "problems I created", or "problems I authored".',
  parameters: GetMyProblemsParams,
  execute: async (args: unknown, client: any) => {
    // LLM parsing can sometimes output wrong format, Zod parses it properly
    const validatedArgs = GetMyProblemsParams.parse(args);
    const response = await client.get('/problems/me', {
      params: validatedArgs,
    });
    return response.data;
  },
};
