import { z } from 'zod';
import { BaseTool } from '../base/base.tool';
import { IApiClient, ITool } from '../tool.interface';

// ─── Shared schemas ───────────────────────────────────────────────────────────

const CoursePaginationSchema = z.object({
  page: z.number().optional().describe('Page number for pagination'),
  limit: z.number().optional().describe('Number of items per page'),
  search: z.string().optional().describe('Search keyword for course title'),
  sortBy: z
    .enum(['createdAt', 'title', 'enrollmentCount', 'rating'])
    .optional()
    .describe('Field to sort by'),
  sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
});

// ─── Tools ────────────────────────────────────────────────────────────────────

class GetCoursesTool extends BaseTool {
  readonly name = 'get_courses';
  readonly description =
    'Get a paginated list of all available courses. ' +
    'Use this when the user wants to browse or search the course catalog.';
  readonly parameters = CoursePaginationSchema;

  protected async run(args: z.infer<typeof CoursePaginationSchema>, client: IApiClient) {
    const response = await client.get('/courses', { params: args });
    return response.data;
  }
}

class GetMyCoursesTool extends BaseTool {
  readonly name = 'get_my_courses';
  readonly description =
    'Get a paginated list of courses created by the current user (instructor view). ' +
    'Use this when the user asks for "my courses", "courses I created", or "courses I teach".';
  readonly parameters = CoursePaginationSchema;

  protected async run(args: z.infer<typeof CoursePaginationSchema>, client: IApiClient) {
    const response = await client.get('/courses/me', { params: args });
    return response.data;
  }
}

class GetCourseTool extends BaseTool {
  readonly name = 'get_course';
  readonly description =
    'Get the full details of a single course by its ID, including sections overview. ' +
    'Use this when the user asks about a specific course.';
  readonly parameters = z.object({
    courseId: z.string().describe('The unique ID of the course'),
  });

  protected async run(args: { courseId: string }, client: IApiClient) {
    const response = await client.get(`/courses/${args.courseId}`);
    return response.data;
  }
}

class GetCourseSectionsTool extends BaseTool {
  readonly name = 'get_course_sections';
  readonly description =
    'Get all sections of a course in order. ' +
    'Use this when the user wants to see the structure or outline of a course.';
  readonly parameters = z.object({
    courseId: z.string().describe('The unique ID of the course'),
  });

  protected async run(args: { courseId: string }, client: IApiClient) {
    const response = await client.get(`/courses/${args.courseId}/sections`);
    return response.data;
  }
}

class GetSectionLessonsTool extends BaseTool {
  readonly name = 'get_section_lessons';
  readonly description =
    'Get all lessons in a specific section of a course. ' +
    'Use this when the user asks what lessons are in a section.';
  readonly parameters = z.object({
    courseId: z.string().describe('The unique ID of the course'),
    sectionId: z.string().describe('The unique ID of the section'),
  });

  protected async run(args: { courseId: string; sectionId: string }, client: IApiClient) {
    const response = await client.get(
      `/courses/${args.courseId}/sections/${args.sectionId}/lessons`,
    );
    return response.data;
  }
}

class GetLessonTool extends BaseTool {
  readonly name = 'get_lesson';
  readonly description =
    'Get the full content of a single lesson including video, text, and attached problems or quizzes. ' +
    'Use this when the user asks about a specific lesson.';
  readonly parameters = z.object({
    courseId: z.string().describe('The unique ID of the course'),
    sectionId: z.string().describe('The unique ID of the section'),
    lessonId: z.string().describe('The unique ID of the lesson'),
  });

  protected async run(
    args: { courseId: string; sectionId: string; lessonId: string },
    client: IApiClient,
  ) {
    const response = await client.get(
      `/courses/${args.courseId}/sections/${args.sectionId}/lessons/${args.lessonId}`,
    );
    return response.data;
  }
}

class GetMyEnrollmentTool extends BaseTool {
  readonly name = 'get_my_enrollment';
  readonly description =
    "Get the current user's enrollment status and details for a specific course. " +
    'Use this when the user asks whether they are enrolled in a course or when their enrollment was approved.';
  readonly parameters = z.object({
    courseId: z.string().describe('The unique ID of the course'),
  });

  protected async run(args: { courseId: string }, client: IApiClient) {
    const response = await client.get(`/courses/${args.courseId}/enrollments/me`);
    return response.data;
  }
}

class GetCourseProgressTool extends BaseTool {
  readonly name = 'get_course_progress';
  readonly description =
    "Get the current user's lesson completion progress for an enrolled course. " +
    'Use this when the user asks how far along they are in a course or which lessons they have completed.';
  readonly parameters = z.object({
    courseId: z.string().describe('The unique ID of the course'),
  });

  protected async run(args: { courseId: string }, client: IApiClient) {
    const response = await client.get(`/courses/${args.courseId}/progress`);
    return response.data;
  }
}

class GetCourseReviewsTool extends BaseTool {
  readonly name = 'get_course_reviews';
  readonly description =
    'Get all reviews and ratings submitted for a course. ' +
    'Use this when the user wants to see feedback or the rating of a course.';
  readonly parameters = z.object({
    courseId: z.string().describe('The unique ID of the course'),
  });

  protected async run(args: { courseId: string }, client: IApiClient) {
    const response = await client.get(`/courses/${args.courseId}/reviews`);
    return response.data;
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const courseTools: ITool[] = [
  new GetCoursesTool(),
  new GetMyCoursesTool(),
  new GetCourseTool(),
  new GetCourseSectionsTool(),
  new GetSectionLessonsTool(),
  new GetLessonTool(),
  new GetMyEnrollmentTool(),
  new GetCourseProgressTool(),
  new GetCourseReviewsTool(),
];
