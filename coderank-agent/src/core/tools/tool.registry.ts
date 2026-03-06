import { ITool } from './tool.interface';

export class ToolRegistry {
  private tools = new Map<string, ITool>();

  /**
   * Register a new tool.
   */
  register(tool: ITool) {
    this.tools.set(tool.name, tool);
  }

  /**
   * Retrieve a tool by its name.
   */
  get(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools as an array.
   */
  getAll(): ITool[] {
    return Array.from(this.tools.values());
  }
}
