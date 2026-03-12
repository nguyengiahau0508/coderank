/**
 * API Endpoint Constants
 * Centralized API endpoint definitions
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    BASE: '/auth',
    GOOGLE: '/auth/google',
    GITHUB: '/auth/github',
    REFRESH: '/auth/refresh-tokens',
    LOGOUT: '/auth/logout',
  },

  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    AVATAR: '/users/avatar',
    BY_ID: (id: string) => `/users/${id}`,
  },

  // Problems
  PROBLEMS: {
    BASE: '/problems',
    BY_ID: (id: string) => `/problems/${id}`,
    TESTCASES: (problemId: string) => `/problems/${problemId}/testcases`,
    TESTCASE_BY_ID: (problemId: string, testcaseId: string) =>
      `/problems/${problemId}/testcases/${testcaseId}`,
    TAGS: (problemId: string, tagId: string) => `/problems/${problemId}/tags/${tagId}`,
    HINTS: (problemId: string) => `/problems/${problemId}/hints`,
    HINT_BY_ID: (problemId: string, hintId: string) =>
      `/problems/${problemId}/hints/${hintId}`,
    SUBMISSIONS: (problemId: string) => `/problems/${problemId}/submissions`,
  },

  // Contests
  CONTESTS: {
    BASE: '/contests',
    BY_ID: (id: string) => `/contests/${id}`,
    PROBLEMS: (contestId: string) => `/contests/${contestId}/problems`,
    PROBLEM_BY_ID: (contestId: string, problemId: string) =>
      `/contests/${contestId}/problems/${problemId}`,
    PARTICIPANTS: (contestId: string) => `/contests/${contestId}/participants`,
    PARTICIPANT_ME: (contestId: string) => `/contests/${contestId}/participants/me`,
    SUBMISSIONS: (contestId: string) => `/contests/${contestId}/submissions`,
    MY_SUBMISSIONS: (contestId: string) => `/contests/${contestId}/submissions/me`,
    LEADERBOARD: (contestId: string) => `/contests/${contestId}/leaderboard`,
  },

  // Runner
  RUNNER: {
    BASE: '/runner',
    RUN: '/runner/run',
  },
} as const;

/**
 * HTTP Method Constants
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

/**
 * Common Query Parameters
 */
export const QUERY_PARAMS = {
  PAGE: 'page',
  LIMIT: 'limit',
  SEARCH: 'search',
  SORT_BY: 'sortBy',
  SORT_ORDER: 'sortOrder',
} as const;

/**
 * Default Pagination Values
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * API Response Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
