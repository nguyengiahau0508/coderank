import {
  PermissionMode,
  PermissionOutcome,
  IPermissionPolicy,
} from './permission.interface';

/**
 * Default permission requirements for built-in tools.
 * Follows the permission mapping from AGENT_DESIGN.md
 */
const DEFAULT_TOOL_PERMISSIONS: Record<string, PermissionMode> = {
  // Read-only tools
  get_problems: PermissionMode.ReadOnly,
  get_problem: PermissionMode.ReadOnly,
  get_my_problems: PermissionMode.ReadOnly,
  get_testcases: PermissionMode.ReadOnly,
  get_hints: PermissionMode.ReadOnly,
  get_submissions: PermissionMode.ReadOnly,
  get_submission: PermissionMode.ReadOnly,
  get_my_submissions: PermissionMode.ReadOnly,
  get_courses: PermissionMode.ReadOnly,
  get_course: PermissionMode.ReadOnly,
  get_my_courses: PermissionMode.ReadOnly,
  get_lessons: PermissionMode.ReadOnly,
  get_lesson: PermissionMode.ReadOnly,

  // Write tools (workspace level)
  create_problem: PermissionMode.WorkspaceWrite,
  update_problem: PermissionMode.WorkspaceWrite,
  delete_problem: PermissionMode.WorkspaceWrite,
  create_testcase: PermissionMode.WorkspaceWrite,
  update_testcase: PermissionMode.WorkspaceWrite,
  delete_testcase: PermissionMode.WorkspaceWrite,
  create_hint: PermissionMode.WorkspaceWrite,
  update_hint: PermissionMode.WorkspaceWrite,
  delete_hint: PermissionMode.WorkspaceWrite,
  create_submission: PermissionMode.WorkspaceWrite,
  create_course: PermissionMode.WorkspaceWrite,
  update_course: PermissionMode.WorkspaceWrite,
  delete_course: PermissionMode.WorkspaceWrite,
  create_lesson: PermissionMode.WorkspaceWrite,
  update_lesson: PermissionMode.WorkspaceWrite,
  delete_lesson: PermissionMode.WorkspaceWrite,
  create_solution: PermissionMode.WorkspaceWrite,
  update_solution: PermissionMode.WorkspaceWrite,
  delete_solution: PermissionMode.WorkspaceWrite,
};

/**
 * Permission level comparison (higher value = more permissions)
 */
const PERMISSION_LEVELS: Record<PermissionMode, number> = {
  [PermissionMode.ReadOnly]: 1,
  [PermissionMode.WorkspaceWrite]: 2,
  [PermissionMode.DangerFullAccess]: 3,
};

/**
 * Permission policy implementation.
 * Checks if the active mode meets the required permission for a tool.
 */
export class PermissionPolicy implements IPermissionPolicy {
  private toolOverrides = new Map<string, PermissionMode>();

  constructor(public readonly activeMode: PermissionMode = PermissionMode.DangerFullAccess) {}

  getRequiredMode(toolName: string): PermissionMode {
    // Check for tool-specific override first
    if (this.toolOverrides.has(toolName)) {
      return this.toolOverrides.get(toolName)!;
    }

    // Fall back to default permission or ReadOnly
    return DEFAULT_TOOL_PERMISSIONS[toolName] ?? PermissionMode.ReadOnly;
  }

  authorize(toolName: string, input: unknown): PermissionOutcome {
    const requiredMode = this.getRequiredMode(toolName);
    const activeLevel = PERMISSION_LEVELS[this.activeMode];
    const requiredLevel = PERMISSION_LEVELS[requiredMode];

    if (activeLevel >= requiredLevel) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `Tool '${toolName}' requires '${requiredMode}' permission, but current mode is '${this.activeMode}'`,
    };
  }

  setToolOverride(toolName: string, mode: PermissionMode): void {
    this.toolOverrides.set(toolName, mode);
  }

  /**
   * Create a policy with full access (for backward compatibility).
   */
  static fullAccess(): PermissionPolicy {
    return new PermissionPolicy(PermissionMode.DangerFullAccess);
  }

  /**
   * Create a policy with read-only access.
   */
  static readOnly(): PermissionPolicy {
    return new PermissionPolicy(PermissionMode.ReadOnly);
  }

  /**
   * Create a policy with workspace write access.
   */
  static workspaceWrite(): PermissionPolicy {
    return new PermissionPolicy(PermissionMode.WorkspaceWrite);
  }
}
