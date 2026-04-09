# Nguyên Lý Thiết Kế Agent System - Rút Ra Từ Claw Code

> Tài liệu này tổng hợp các nguyên lý, pattern và best practices để thiết kế hệ thống Agent từ việc phân tích source code của Claw Code project.

---

## Mục Lục

1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Core Components](#2-core-components)
3. [Conversation Runtime Loop](#3-conversation-runtime-loop)
4. [Tool System Design](#4-tool-system-design)
5. [Permission System](#5-permission-system)
6. [Hook System](#6-hook-system)
7. [Plugin Architecture](#7-plugin-architecture)
8. [Session Management](#8-session-management)
9. [Prompt Engineering](#9-prompt-engineering)
10. [MCP (Model Context Protocol)](#10-mcp-model-context-protocol)
11. [Configuration System](#11-configuration-system)
12. [Command System](#12-command-system)
13. [Context Compaction](#13-context-compaction)
14. [Error Handling Patterns](#14-error-handling-patterns)
15. [Best Practices & Lessons Learned](#15-best-practices--lessons-learned)

---

## 1. Tổng Quan Kiến Trúc

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLI / REPL Layer                         │
│  (User Input, Output Rendering, Interactive Session)            │
├─────────────────────────────────────────────────────────────────┤
│                    Commands Layer (/commands)                    │
│  (Slash commands: /help, /model, /permissions, /config...)      │
├─────────────────────────────────────────────────────────────────┤
│                   Conversation Runtime                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐    │
│  │ API Client  │ │Tool Executor│ │ Permission Policy       │    │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐    │
│  │ Hook Runner │ │  Session    │ │ Usage Tracker           │    │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                        Tool Registry                             │
│  (bash, read_file, write_file, grep, glob, WebFetch, Agent...)  │
├─────────────────────────────────────────────────────────────────┤
│                        Plugin System                             │
│  (Builtin, Bundled, External plugins + custom tools/hooks)       │
├─────────────────────────────────────────────────────────────────┤
│                    MCP (Model Context Protocol)                  │
│  (External tool servers: stdio, SSE, HTTP, WebSocket)            │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Design Principles

| Nguyên Lý | Mô Tả |
|-----------|-------|
| **Separation of Concerns** | Mỗi component có trách nhiệm rõ ràng: API client xử lý giao tiếp, Tool executor thực thi tools, Permission policy kiểm tra quyền |
| **Trait-based Abstraction** | Sử dụng traits/interfaces (ApiClient, ToolExecutor) để tách biệt implementation |
| **Configuration Layering** | Config được merge từ nhiều nguồn: User → Project → Local với độ ưu tiên tăng dần |
| **Hook-driven Extensibility** | PreToolUse/PostToolUse hooks cho phép can thiệp vào flow mà không sửa core |
| **Streaming-first Design** | API streaming cho phép response real-time và tool calling trong stream |

---

## 2. Core Components

### 2.1 ConversationRuntime - Trái Tim Của Hệ Thống

```rust
// Rust implementation
pub struct ConversationRuntime<C, T> {
    session: Session,              // Lưu trữ conversation history
    api_client: C,                 // Giao tiếp với AI provider
    tool_executor: T,              // Thực thi tools
    permission_policy: PermissionPolicy,  // Kiểm tra quyền
    system_prompt: Vec<String>,    // System prompt sections
    max_iterations: usize,         // Giới hạn loop iterations
    usage_tracker: UsageTracker,   // Theo dõi token usage
    hook_runner: HookRunner,       // Chạy pre/post hooks
}
```

**Nguyên tắc thiết kế:**

- Generic over `ApiClient` và `ToolExecutor` traits → dễ test và swap implementation
- Session được inject vào, không tự tạo → testable, resumable
- Usage tracking tách biệt → có thể swap metric backend
- Hook runner optional → graceful degradation

### 2.2 Session Structure

```rust
pub struct Session {
    pub version: u32,                       // Schema version cho migration
    pub messages: Vec<ConversationMessage>, // History
}

pub struct ConversationMessage {
    pub role: MessageRole,          // System | User | Assistant | Tool
    pub blocks: Vec<ContentBlock>,  // Text, ToolUse, ToolResult
    pub usage: Option<TokenUsage>,  // Usage metadata per message
}

pub enum ContentBlock {
    Text { text: String },
    ToolUse { id: String, name: String, input: String },
    ToolResult { tool_use_id: String, tool_name: String, output: String, is_error: bool },
}
```

**Nguyên tắc:**

- Versioned schema → backward compatible migrations
- Block-based content → linh hoạt cho mixed content (text + tool calls)
- Tool results link to tool uses via ID → traceable execution

---

## 3. Conversation Runtime Loop

### 3.1 Core Loop Algorithm

```
┌──────────────────────────────────────────────────────────────────┐
│                    CONVERSATION LOOP                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Add user message to session                                   │
│     ↓                                                            │
│  2. LOOP:                                                        │
│     ├─ Check iteration limit (prevent infinite loops)            │
│     ├─ Build API request (system prompt + messages)              │
│     ├─ Stream API response                                       │
│     ├─ Build assistant message from events                       │
│     ├─ Track usage                                               │
│     ├─ Extract pending tool uses                                 │
│     ├─ Add assistant message to session                          │
│     │                                                            │
│     ├─ IF no tool uses → BREAK (response complete)               │
│     │                                                            │
│     └─ FOR each tool use:                                        │
│         ├─ Check permission (authorize)                          │
│         ├─ IF denied → create error tool result                  │
│         ├─ ELSE:                                                 │
│         │   ├─ Run PreToolUse hooks                              │
│         │   ├─ IF hook denied → create error result              │
│         │   ├─ ELSE:                                             │
│         │   │   ├─ Execute tool                                  │
│         │   │   ├─ Run PostToolUse hooks                         │
│         │   │   └─ Merge hook feedback into output               │
│         │   └─ Create tool result message                        │
│         └─ Add tool result to session                            │
│                                                                   │
│  3. Return TurnSummary (messages, tool_results, iterations, usage)│
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Key Implementation Details

```rust
pub fn run_turn(&mut self, user_input: impl Into<String>, mut prompter: Option<&mut dyn PermissionPrompter>) -> Result<TurnSummary, RuntimeError> {
    // 1. Add user input
    self.session.messages.push(ConversationMessage::user_text(user_input.into()));
    
    let mut iterations = 0;
    
    loop {
        iterations += 1;
        
        // 2. Guard against infinite loops
        if iterations > self.max_iterations {
            return Err(RuntimeError::new("exceeded max iterations"));
        }
        
        // 3. Call API
        let events = self.api_client.stream(request)?;
        let (assistant_message, usage) = build_assistant_message(events)?;
        
        // 4. Track usage
        if let Some(usage) = usage {
            self.usage_tracker.record(usage);
        }
        
        // 5. Extract tool uses
        let pending_tool_uses = extract_tool_uses(&assistant_message);
        self.session.messages.push(assistant_message.clone());
        
        // 6. No tools = done
        if pending_tool_uses.is_empty() {
            break;
        }
        
        // 7. Execute each tool with permission/hook checks
        for (tool_use_id, tool_name, input) in pending_tool_uses {
            let result_message = self.execute_tool_with_checks(
                tool_use_id, tool_name, input, &mut prompter
            );
            self.session.messages.push(result_message);
        }
    }
    
    Ok(TurnSummary { ... })
}
```

### 3.3 Nguyên Tắc Quan Trọng

| Aspect | Principle |
|--------|-----------|
| **Iteration Limit** | LUÔN có max_iterations để prevent infinite loops. Default: `usize::MAX` nhưng có thể config |
| **Tool Execution Order** | Tools được execute tuần tự theo thứ tự model request |
| **Error Propagation** | Tool errors trả về trong tool_result (is_error=true), không crash loop |
| **Permission First** | Check permission TRƯỚC khi run hooks/execute |
| **Hook Integration** | Hooks CÓ THỂ deny tool execution hoặc modify output |

---

## 4. Tool System Design

### 4.1 Tool Specification Pattern

```rust
pub struct ToolSpec {
    pub name: &'static str,         // Unique identifier
    pub description: &'static str,  // Mô tả cho AI hiểu cách dùng
    pub input_schema: Value,        // JSON Schema validate input
    pub required_permission: PermissionMode, // Permission level cần
}
```

**Best Practices:**

- Name: snake_case, descriptive, không conflict
- Description: Explain WHAT it does, WHEN to use, WHAT returns
- Schema: Strict JSON Schema với required fields rõ ràng

### 4.2 Tool Categories & Permission Mapping

```rust
// Permission levels từ thấp → cao
pub enum PermissionMode {
    ReadOnly,           // Chỉ đọc: read_file, grep, glob
    WorkspaceWrite,     // Ghi trong workspace: write_file, edit_file
    DangerFullAccess,   // Toàn quyền: bash, Agent
    Prompt,             // Hỏi user mỗi lần
    Allow,              // Cho phép tất cả
}
```

### 4.3 Built-in Tool Registry

```rust
pub fn mvp_tool_specs() -> Vec<ToolSpec> {
    vec![
        // === File System Tools ===
        ToolSpec {
            name: "bash",
            description: "Execute a shell command in the current workspace.",
            required_permission: PermissionMode::DangerFullAccess,
            input_schema: json!({
                "type": "object",
                "properties": {
                    "command": { "type": "string" },
                    "timeout": { "type": "integer", "minimum": 1 },
                    "run_in_background": { "type": "boolean" }
                },
                "required": ["command"]
            }),
        },
        
        ToolSpec {
            name: "read_file",
            description: "Read a text file from the workspace.",
            required_permission: PermissionMode::ReadOnly,
            input_schema: json!({
                "type": "object",
                "properties": {
                    "path": { "type": "string" },
                    "offset": { "type": "integer", "minimum": 0 },
                    "limit": { "type": "integer", "minimum": 1 }
                },
                "required": ["path"]
            }),
        },
        
        // === Search Tools ===
        ToolSpec {
            name: "grep_search",
            description: "Search file contents with a regex pattern.",
            required_permission: PermissionMode::ReadOnly,
            input_schema: json!({
                "properties": {
                    "pattern": { "type": "string" },
                    "path": { "type": "string" },
                    "glob": { "type": "string" },
                    "-C": { "type": "integer" }  // Context lines
                },
                "required": ["pattern"]
            }),
        },
        
        // === Agent/Orchestration Tools ===
        ToolSpec {
            name: "Agent",
            description: "Launch a specialized agent task and persist its handoff metadata.",
            required_permission: PermissionMode::DangerFullAccess,
            input_schema: json!({
                "properties": {
                    "description": { "type": "string" },
                    "prompt": { "type": "string" },
                    "subagent_type": { "type": "string" },
                    "model": { "type": "string" }
                },
                "required": ["description", "prompt"]
            }),
        },
        
        // ... more tools
    ]
}
```

### 4.4 Global Tool Registry Pattern

```rust
pub struct GlobalToolRegistry {
    plugin_tools: Vec<PluginTool>, // Tools từ plugins
}

impl GlobalToolRegistry {
    // Merge builtin + plugin tools, validate no conflicts
    pub fn with_plugin_tools(plugin_tools: Vec<PluginTool>) -> Result<Self, String> {
        let builtin_names: BTreeSet<_> = mvp_tool_specs()
            .into_iter()
            .map(|spec| spec.name.to_string())
            .collect();
        
        // Check conflicts
        for tool in &plugin_tools {
            if builtin_names.contains(&tool.name) {
                return Err(format!("plugin tool conflicts with builtin: {}", tool.name));
            }
        }
        
        Ok(Self { plugin_tools })
    }
    
    // Get all tool definitions for API request
    pub fn definitions(&self, allowed_tools: Option<&BTreeSet<String>>) -> Vec<ToolDefinition> {
        let builtin = mvp_tool_specs()
            .filter(|spec| allowed_tools.is_none_or(|a| a.contains(spec.name)));
        let plugin = self.plugin_tools
            .filter(|tool| allowed_tools.is_none_or(|a| a.contains(&tool.name)));
        builtin.chain(plugin).collect()
    }
    
    // Execute tool by name
    pub fn execute(&self, name: &str, input: &Value) -> Result<String, String> {
        if is_builtin(name) {
            execute_builtin_tool(name, input)
        } else {
            self.plugin_tools
                .find(|t| t.name == name)
                .ok_or_else(|| format!("unknown tool: {name}"))?
                .execute(input)
        }
    }
}
```

### 4.5 Tool Normalization & Aliases

```rust
// Normalize tool names for lookup
fn normalize_tool_name(value: &str) -> String {
    value.trim().replace('-', "_").to_ascii_lowercase()
}

// Support aliases for common tools
let aliases = [
    ("read", "read_file"),
    ("write", "write_file"),
    ("edit", "edit_file"),
    ("glob", "glob_search"),
    ("grep", "grep_search"),
];
```

---

## 5. Permission System

### 5.1 Permission Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Permission Flow                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tool Request                                                    │
│       ↓                                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ PermissionPolicy.authorize(tool_name, input, prompter)  │    │
│  └─────────────────────────────────────────────────────────┘    │
│       ↓                                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Check: active_mode >= required_mode?                    │    │
│  │   → YES: Allow                                          │    │
│  │   → NO:  Check if prompter available                    │    │
│  │          → YES: prompter.decide() → Allow/Deny          │    │
│  │          → NO:  Deny with reason                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│       ↓                                                         │
│  PermissionOutcome::Allow | PermissionOutcome::Deny { reason }  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Permission Policy Implementation

```rust
pub struct PermissionPolicy {
    active_mode: PermissionMode,                    // Current permission level
    tool_requirements: BTreeMap<String, PermissionMode>, // Per-tool overrides
}

impl PermissionPolicy {
    pub fn authorize(
        &self,
        tool_name: &str,
        input: &str,
        mut prompter: Option<&mut dyn PermissionPrompter>,
    ) -> PermissionOutcome {
        let current_mode = self.active_mode();
        let required_mode = self.required_mode_for(tool_name);
        
        // Allow mode = always allow
        if current_mode == PermissionMode::Allow {
            return PermissionOutcome::Allow;
        }
        
        // Check if current mode meets requirement
        if current_mode >= required_mode {
            return PermissionOutcome::Allow;
        }
        
        // Prompt mode or escalation needed
        if needs_prompt(current_mode, required_mode) {
            match prompter.as_mut() {
                Some(p) => match p.decide(&request) {
                    PermissionPromptDecision::Allow => PermissionOutcome::Allow,
                    PermissionPromptDecision::Deny { reason } => PermissionOutcome::Deny { reason },
                },
                None => PermissionOutcome::Deny {
                    reason: format!("tool '{}' requires approval", tool_name),
                },
            }
        } else {
            PermissionOutcome::Deny {
                reason: format!("tool '{}' requires {} permission; current is {}",
                    tool_name, required_mode.as_str(), current_mode.as_str()),
            }
        }
    }
}
```

### 5.3 Permission Prompter Trait

```rust
pub trait PermissionPrompter {
    fn decide(&mut self, request: &PermissionRequest) -> PermissionPromptDecision;
}

// CLI implementation example
struct CliPrompter;

impl PermissionPrompter for CliPrompter {
    fn decide(&mut self, request: &PermissionRequest) -> PermissionPromptDecision {
        println!("Tool '{}' requires {} permission. Allow? [y/n]", 
            request.tool_name, request.required_mode.as_str());
        
        let mut input = String::new();
        std::io::stdin().read_line(&mut input).unwrap();
        
        match input.trim() {
            "y" | "yes" => PermissionPromptDecision::Allow,
            _ => PermissionPromptDecision::Deny { reason: "user denied".to_string() },
        }
    }
}
```

---

## 6. Hook System

### 6.1 Hook Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Hook Pipeline                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tool Execution Request                                          │
│        ↓                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PreToolUse Hooks (sequential)                            │   │
│  │   hook1.sh → hook2.py → hook3                            │   │
│  │   Exit 0: Allow (with optional message)                  │   │
│  │   Exit 2: Deny (stop execution)                          │   │
│  │   Exit other: Warn (continue with warning)               │   │
│  └──────────────────────────────────────────────────────────┘   │
│        ↓ (if allowed)                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Tool Execution                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│        ↓                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PostToolUse Hooks (sequential)                           │   │
│  │   Receives: tool output, is_error status                 │   │
│  │   Can: modify output, deny result, add warnings          │   │
│  └──────────────────────────────────────────────────────────┘   │
│        ↓                                                        │
│  Final Tool Result                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Hook Runner Implementation

```rust
pub struct HookRunner {
    config: RuntimeHookConfig,
}

impl HookRunner {
    pub fn run_pre_tool_use(&self, tool_name: &str, tool_input: &str) -> HookRunResult {
        self.run_commands(
            HookEvent::PreToolUse,
            self.config.pre_tool_use(),
            tool_name,
            tool_input,
            None,  // no output yet
            false, // not an error
        )
    }
    
    pub fn run_post_tool_use(
        &self,
        tool_name: &str,
        tool_input: &str,
        tool_output: &str,
        is_error: bool,
    ) -> HookRunResult {
        self.run_commands(
            HookEvent::PostToolUse,
            self.config.post_tool_use(),
            tool_name,
            tool_input,
            Some(tool_output),
            is_error,
        )
    }
    
    fn run_commands(&self, event: HookEvent, commands: &[String], ...) -> HookRunResult {
        let payload = json!({
            "hook_event_name": event.as_str(),
            "tool_name": tool_name,
            "tool_input": parse_tool_input(tool_input),
            "tool_output": tool_output,
            "tool_result_is_error": is_error,
        });
        
        let mut messages = Vec::new();
        
        for command in commands {
            match self.run_command(command, &payload) {
                HookCommandOutcome::Allow { message } => {
                    if let Some(msg) = message {
                        messages.push(msg);
                    }
                }
                HookCommandOutcome::Deny { message } => {
                    messages.push(message.unwrap_or_default());
                    return HookRunResult { denied: true, messages };
                }
                HookCommandOutcome::Warn { message } => {
                    messages.push(message);
                }
            }
        }
        
        HookRunResult::allow(messages)
    }
}
```

### 6.3 Hook Environment Variables

Hooks receive context via environment variables:

| Variable | Description |
|----------|-------------|
| `HOOK_EVENT` | `PreToolUse` or `PostToolUse` |
| `HOOK_TOOL_NAME` | Name of the tool being executed |
| `HOOK_TOOL_INPUT` | JSON string of tool input |
| `HOOK_TOOL_OUTPUT` | Tool output (PostToolUse only) |
| `HOOK_TOOL_IS_ERROR` | `"1"` if tool errored, `"0"` otherwise |

Plus JSON payload via stdin containing all context.

### 6.4 Hook Exit Code Convention

| Exit Code | Meaning |
|-----------|---------|
| 0 | Allow - tool execution continues |
| 2 | Deny - tool execution stopped |
| Other | Warn - continue with warning message |

---

## 7. Plugin Architecture

### 7.1 Plugin Types

```rust
pub enum PluginKind {
    Builtin,   // Ships with the CLI
    Bundled,   // Installed from official registry
    External,  // User-installed from external sources
}
```

### 7.2 Plugin Manifest Structure

```json
{
    "name": "my-plugin",
    "version": "1.0.0",
    "description": "Plugin description",
    "permissions": ["read", "write", "execute"],
    "defaultEnabled": true,
    "hooks": {
        "PreToolUse": ["./hooks/pre.sh"],
        "PostToolUse": ["./hooks/post.sh"]
    },
    "lifecycle": {
        "Init": ["./setup.sh"],
        "Shutdown": ["./cleanup.sh"]
    },
    "tools": [
        {
            "name": "my_tool",
            "description": "Tool description",
            "inputSchema": {...},
            "command": "./bin/my_tool",
            "args": ["--json"],
            "required_permission": "workspace-write"
        }
    ],
    "commands": [
        {
            "name": "/mycommand",
            "description": "Command description",
            "script": "./commands/mycommand.sh"
        }
    ]
}
```

### 7.3 Plugin Manager Pattern

```rust
pub struct PluginManager {
    config: PluginManagerConfig,
    loaded_plugins: Vec<LoadedPlugin>,
    enabled_map: BTreeMap<String, bool>,
}

impl PluginManager {
    pub fn discover(&mut self) -> Result<(), PluginError> {
        // 1. Load builtin plugins
        self.load_builtins()?;
        
        // 2. Load bundled plugins from registry
        self.load_bundled()?;
        
        // 3. Load external plugins from configured directories
        self.load_external()?;
        
        // 4. Apply enabled/disabled settings
        self.apply_settings()?;
        
        Ok(())
    }
    
    pub fn get_hooks(&self) -> PluginHooks {
        self.loaded_plugins
            .iter()
            .filter(|p| self.is_enabled(&p.id))
            .fold(PluginHooks::default(), |acc, p| acc.merged_with(&p.hooks))
    }
    
    pub fn get_tools(&self) -> Vec<PluginTool> {
        self.loaded_plugins
            .iter()
            .filter(|p| self.is_enabled(&p.id))
            .flat_map(|p| p.tools.clone())
            .collect()
    }
}
```

---

## 8. Session Management

### 8.1 Session Persistence

```rust
impl Session {
    pub fn save_to_path(&self, path: impl AsRef<Path>) -> Result<(), SessionError> {
        fs::write(path, self.to_json().render())?;
        Ok(())
    }
    
    pub fn load_from_path(path: impl AsRef<Path>) -> Result<Self, SessionError> {
        let contents = fs::read_to_string(path)?;
        Self::from_json(&JsonValue::parse(&contents)?)
    }
}
```

### 8.2 Session Format

```json
{
    "version": 1,
    "messages": [
        {
            "role": "user",
            "blocks": [
                { "type": "text", "text": "Hello" }
            ]
        },
        {
            "role": "assistant",
            "blocks": [
                { "type": "text", "text": "Hi there!" },
                { "type": "tool_use", "id": "tool-1", "name": "read_file", "input": "{\"path\": \"README.md\"}" }
            ],
            "usage": {
                "input_tokens": 100,
                "output_tokens": 50,
                "cache_creation_input_tokens": 0,
                "cache_read_input_tokens": 10
            }
        },
        {
            "role": "tool",
            "blocks": [
                { "type": "tool_result", "tool_use_id": "tool-1", "tool_name": "read_file", "output": "# README...", "is_error": false }
            ]
        }
    ]
}
```

### 8.3 Resume Session Pattern

```rust
fn resume_session(session_path: &Path, commands: &[String]) {
    // 1. Load saved session
    let session = Session::load_from_path(session_path)?;
    
    // 2. Reconstruct runtime
    let runtime = ConversationRuntime::new(
        session,
        api_client,
        tool_executor,
        permission_policy,
        system_prompt,
    );
    
    // 3. Execute resume commands if any
    for command in commands {
        handle_command(command)?;
    }
    
    // 4. Continue conversation
    runtime.run_turn(next_input)?;
}
```

---

## 9. Prompt Engineering

### 9.1 System Prompt Structure

```rust
pub struct SystemPromptBuilder {
    output_style_name: Option<String>,
    output_style_prompt: Option<String>,
    os_name: Option<String>,
    os_version: Option<String>,
    append_sections: Vec<String>,
    project_context: Option<ProjectContext>,
    config: Option<RuntimeConfig>,
}

impl SystemPromptBuilder {
    pub fn build(&self) -> Vec<String> {
        let mut sections = Vec::new();
        
        // 1. Intro section (who you are)
        sections.push(get_simple_intro_section());
        
        // 2. Output style if specified
        if let (Some(name), Some(prompt)) = (&self.output_style_name, &self.output_style_prompt) {
            sections.push(format!("# Output Style: {name}\n{prompt}"));
        }
        
        // 3. System behavior section
        sections.push(get_simple_system_section());
        
        // 4. How to do tasks
        sections.push(get_simple_doing_tasks_section());
        
        // 5. Available actions/tools
        sections.push(get_actions_section());
        
        // 6. Dynamic boundary marker
        sections.push(SYSTEM_PROMPT_DYNAMIC_BOUNDARY.to_string());
        
        // 7. Environment context (OS, date, cwd)
        sections.push(self.environment_section());
        
        // 8. Project context (git status, instruction files)
        if let Some(ctx) = &self.project_context {
            sections.push(render_project_context(ctx));
            if !ctx.instruction_files.is_empty() {
                sections.push(render_instruction_files(&ctx.instruction_files));
            }
        }
        
        // 9. Runtime config section
        if let Some(config) = &self.config {
            sections.push(render_config_section(config));
        }
        
        // 10. Appended custom sections
        sections.extend(self.append_sections.iter().cloned());
        
        sections
    }
}
```

### 9.2 Project Context Discovery

```rust
pub struct ProjectContext {
    pub cwd: PathBuf,
    pub current_date: String,
    pub git_status: Option<String>,
    pub git_diff: Option<String>,
    pub instruction_files: Vec<ContextFile>,
}

fn discover_instruction_files(cwd: &Path) -> Vec<ContextFile> {
    // Walk up directory tree to find instruction files
    let mut directories = Vec::new();
    let mut cursor = Some(cwd);
    while let Some(dir) = cursor {
        directories.push(dir.to_path_buf());
        cursor = dir.parent();
    }
    directories.reverse(); // Root first
    
    let mut files = Vec::new();
    for dir in directories {
        // Check standard locations
        for candidate in [
            dir.join("CLAW.md"),           // Main project instructions
            dir.join("CLAW.local.md"),     // Local overrides
            dir.join(".claw").join("CLAW.md"),
            dir.join(".claw").join("instructions.md"),
        ] {
            if let Ok(content) = fs::read_to_string(&candidate) {
                if !content.trim().is_empty() {
                    files.push(ContextFile { path: candidate, content });
                }
            }
        }
    }
    
    dedupe_instruction_files(files)
}
```

### 9.3 Instruction File Limits

```rust
const MAX_INSTRUCTION_FILE_CHARS: usize = 4_000;   // Per file
const MAX_TOTAL_INSTRUCTION_CHARS: usize = 12_000; // Total budget
```

**Best Practices:**

- Truncate large files gracefully với `[truncated]` marker
- Dedupe duplicate content across files
- Show file scope (which directory each came from)

---

## 10. MCP (Model Context Protocol)

### 10.1 MCP Server Types

```rust
pub enum McpServerConfig {
    Stdio(McpStdioServerConfig),      // Local process via stdin/stdout
    Sse(McpRemoteServerConfig),       // Server-Sent Events
    Http(McpRemoteServerConfig),      // HTTP/REST
    Ws(McpWebSocketServerConfig),     // WebSocket
    Sdk(McpSdkServerConfig),          // SDK integration
    ManagedProxy(McpManagedProxyServerConfig), // Cloud proxy
}
```

### 10.2 MCP Tool Naming Convention

```rust
pub fn mcp_tool_name(server_name: &str, tool_name: &str) -> String {
    format!(
        "mcp__{}__{}",
        normalize_name_for_mcp(server_name),
        normalize_name_for_mcp(tool_name)
    )
}

// Example: mcp__github_com__search_issues
```

### 10.3 MCP Configuration

```json
{
    "mcpServers": {
        "github": {
            "command": "uvx",
            "args": ["mcp-server-github"],
            "env": {
                "GITHUB_TOKEN": "${GITHUB_TOKEN}"
            }
        },
        "web-search": {
            "type": "sse",
            "url": "https://api.example.com/mcp",
            "headers": {
                "Authorization": "Bearer ${API_KEY}"
            }
        }
    }
}
```

---

## 11. Configuration System

### 11.1 Configuration Layering

```
Priority (low → high):
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Config                                                   │
│    ~/.config/claw/settings.json                                 │
│    ~/.claw.json (legacy)                                        │
├─────────────────────────────────────────────────────────────────┤
│ 2. Project Config                                               │
│    <project>/.claw/settings.json                                │
│    <project>/.claw.json                                         │
├─────────────────────────────────────────────────────────────────┤
│ 3. Local Config (not committed)                                 │
│    <project>/.claw/settings.local.json                          │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Config Loader Pattern

```rust
pub struct ConfigLoader {
    cwd: PathBuf,
    config_home: PathBuf,
}

impl ConfigLoader {
    pub fn load(&self) -> Result<RuntimeConfig, ConfigError> {
        let entries = self.discover();
        
        let mut merged = BTreeMap::new();
        
        for entry in entries {
            let content = fs::read_to_string(&entry.path)?;
            let parsed = JsonValue::parse(&content)?;
            
            // Deep merge với priority
            deep_merge(&mut merged, parsed.as_object()?);
        }
        
        RuntimeConfig::from_merged(merged)
    }
    
    fn discover(&self) -> Vec<ConfigEntry> {
        let mut entries = Vec::new();
        
        // User level
        if let Ok(path) = self.user_config_path() {
            if path.exists() {
                entries.push(ConfigEntry { source: ConfigSource::User, path });
            }
        }
        
        // Project level
        for candidate in self.project_config_candidates() {
            if candidate.exists() {
                entries.push(ConfigEntry { source: ConfigSource::Project, path: candidate });
            }
        }
        
        // Local level
        if let Ok(path) = self.local_config_path() {
            if path.exists() {
                entries.push(ConfigEntry { source: ConfigSource::Local, path });
            }
        }
        
        entries
    }
}
```

### 11.3 Feature Config Structure

```rust
pub struct RuntimeFeatureConfig {
    hooks: RuntimeHookConfig,
    plugins: RuntimePluginConfig,
    mcp: McpConfigCollection,
    oauth: Option<OAuthConfig>,
    model: Option<String>,
    permission_mode: Option<ResolvedPermissionMode>,
    sandbox: SandboxConfig,
}
```

---

## 12. Command System

### 12.1 Slash Command Pattern

```rust
pub struct SlashCommandSpec {
    pub name: &'static str,           // "/help"
    pub aliases: &'static [&'static str],
    pub summary: &'static str,
    pub argument_hint: Option<&'static str>,  // "[model]"
    pub resume_supported: bool,       // Can run in resumed session?
    pub category: SlashCommandCategory,
}

pub enum SlashCommandCategory {
    Core,        // /help, /status, /model
    Workspace,   // /config, /memory, /init
    Session,     // /clear, /resume, /export
    Git,         // /diff, /commit
    Automation,  // /agents, /skills, /plugins
}
```

### 12.2 Command Registry

```rust
const SLASH_COMMAND_SPECS: &[SlashCommandSpec] = &[
    SlashCommandSpec {
        name: "help",
        aliases: &[],
        summary: "Show available slash commands",
        argument_hint: None,
        resume_supported: true,
        category: SlashCommandCategory::Core,
    },
    SlashCommandSpec {
        name: "model",
        aliases: &[],
        summary: "Show or switch the active model",
        argument_hint: Some("[model]"),
        resume_supported: false,
        category: SlashCommandCategory::Core,
    },
    // ... more commands
];
```

### 12.3 Command Routing

```rust
pub enum SlashCommand {
    Help,
    Status,
    Model { target: Option<String> },
    Permissions { mode: Option<String> },
    Clear { confirm: bool },
    Resume { path: PathBuf },
    // ...
}

impl SlashCommand {
    pub fn parse(input: &str) -> Option<Self> {
        let parts: Vec<&str> = input.trim().split_whitespace().collect();
        let command = parts.first()?.strip_prefix('/')?;
        
        match command {
            "help" => Some(Self::Help),
            "model" => Some(Self::Model { target: parts.get(1).map(|s| s.to_string()) }),
            "permissions" => Some(Self::Permissions { mode: parts.get(1).map(|s| s.to_string()) }),
            _ => None,
        }
    }
}
```

---

## 13. Context Compaction

### 13.1 When to Compact

```rust
pub fn should_compact(session: &Session, config: CompactionConfig) -> bool {
    let start = compacted_summary_prefix_len(session);
    let compactable = &session.messages[start..];
    
    // Compact when:
    // 1. More messages than preserve_recent_messages
    // 2. Total tokens exceed threshold
    compactable.len() > config.preserve_recent_messages
        && estimate_tokens(compactable) >= config.max_estimated_tokens
}
```

### 13.2 Compaction Algorithm

```rust
pub fn compact_session(session: &Session, config: CompactionConfig) -> CompactionResult {
    // 1. Check if existing summary exists
    let existing_summary = session.messages.first()
        .and_then(extract_existing_compacted_summary);
    
    // 2. Split messages: old (to summarize) vs recent (to preserve)
    let keep_from = session.messages.len()
        .saturating_sub(config.preserve_recent_messages);
    let removed = &session.messages[..keep_from];
    let preserved = &session.messages[keep_from..];
    
    // 3. Generate summary of removed messages
    let summary = merge_compact_summaries(
        existing_summary.as_deref(),
        &summarize_messages(removed)
    );
    
    // 4. Build continuation message
    let continuation = get_compact_continuation_message(
        &summary,
        suppress_follow_up_questions: true,
        recent_messages_preserved: !preserved.is_empty(),
    );
    
    // 5. Create compacted session
    let mut compacted_messages = vec![
        ConversationMessage::system(continuation)
    ];
    compacted_messages.extend(preserved.to_vec());
    
    CompactionResult {
        summary,
        compacted_session: Session { messages: compacted_messages, .. },
        removed_message_count: removed.len(),
    }
}
```

### 13.3 Compaction Config

```rust
pub struct CompactionConfig {
    pub preserve_recent_messages: usize, // Default: 4
    pub max_estimated_tokens: usize,     // Default: 10,000
}
```

---

## 14. Error Handling Patterns

### 14.1 Error Types

```rust
// Specific error types for each domain
pub struct RuntimeError { message: String }
pub struct ToolError { message: String }
pub struct SessionError { /* Io, Json, Format variants */ }
pub struct ConfigError { /* Io, Parse variants */ }
pub struct PluginError { /* Load, Validate, Execute variants */ }
```

### 14.2 Error Propagation Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                   Error Handling Strategy                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tool Errors → Return in tool_result, don't crash loop          │
│  API Errors → Propagate up, let CLI handle                      │
│  Config Errors → Use defaults, warn user                        │
│  Hook Errors → Warn and continue (unless exit 2)                │
│  Plugin Errors → Disable plugin, continue with rest             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 14.3 Graceful Degradation

```rust
// Example: Config loading with fallbacks
impl RuntimeConfig {
    pub fn load_or_default() -> Self {
        match ConfigLoader::default_for(env::current_dir().unwrap_or_default()).load() {
            Ok(config) => config,
            Err(e) => {
                eprintln!("Warning: failed to load config: {e}");
                Self::default()
            }
        }
    }
}
```

---

## 15. Best Practices & Lessons Learned

### 15.1 Architecture Best Practices

| Practice | Description |
|----------|-------------|
| **Trait-based Design** | Define traits (ApiClient, ToolExecutor, PermissionPrompter) → easy testing, swappable implementations |
| **Composition over Inheritance** | ConversationRuntime composes Session, ApiClient, ToolExecutor thay vì inherit |
| **Single Responsibility** | Mỗi module một trách nhiệm: hooks.rs chỉ làm hooks, permissions.rs chỉ làm permissions |
| **Configuration Layering** | User < Project < Local với clear merge semantics |
| **Streaming-first** | Design APIs để support streaming từ đầu, dễ thêm batch mode sau |

### 15.2 Tool Design Best Practices

| Practice | Description |
|----------|-------------|
| **Descriptive Names** | `read_file` > `rf`, `grep_search` > `search` |
| **Strict Schemas** | JSON Schema với required fields, types, và constraints |
| **Permission Mapping** | Mỗi tool phải declare permission level cần |
| **Idempotent When Possible** | `read_file` không side effects, luôn safe to retry |
| **Error Messages** | Return useful errors, không empty strings |

### 15.3 Session Management Best Practices

| Practice | Description |
|----------|-------------|
| **Versioned Schema** | `version: 1` trong session JSON → backward compatible migrations |
| **Atomic Writes** | Write to temp file, then rename |
| **Compaction Strategy** | Preserve recent messages, summarize old ones |
| **Resume Support** | Sessions có thể load và continue bất cứ lúc nào |

### 15.4 Security Considerations

| Area | Consideration |
|------|---------------|
| **Permissions** | Default to restrictive (ReadOnly), escalate only when needed |
| **Hook Execution** | Hooks run với user privileges, not elevated |
| **Config Secrets** | Use environment variables `${VAR}` syntax, không hardcode |
| **Plugin Sandboxing** | Plugins declare permissions, enforced at runtime |
| **Tool Input Validation** | Validate via JSON Schema BEFORE execution |

### 15.5 Testing Strategies

```rust
// Mock ApiClient for testing
struct MockApiClient {
    responses: Vec<Vec<AssistantEvent>>,
}

impl ApiClient for MockApiClient {
    fn stream(&mut self, _request: ApiRequest) -> Result<Vec<AssistantEvent>, RuntimeError> {
        Ok(self.responses.remove(0))
    }
}

// Test conversation loop
#[test]
fn test_tool_execution_loop() {
    let mock_client = MockApiClient {
        responses: vec![
            // First response: tool call
            vec![
                AssistantEvent::ToolUse { id: "1", name: "read_file", input: "{}" },
                AssistantEvent::MessageStop,
            ],
            // Second response: final text
            vec![
                AssistantEvent::TextDelta("Done!".to_string()),
                AssistantEvent::MessageStop,
            ],
        ],
    };
    
    let mut runtime = ConversationRuntime::new(
        Session::new(),
        mock_client,
        mock_tool_executor,
        PermissionPolicy::new(PermissionMode::Allow),
        vec![],
    );
    
    let result = runtime.run_turn("test", None).unwrap();
    assert_eq!(result.iterations, 2);
    assert_eq!(result.tool_results.len(), 1);
}
```

---

## Appendix A: Quick Reference Card

### A.1 File Structure

```
/project
├── .claw/
│   ├── settings.json        # Project config
│   ├── settings.local.json  # Local overrides (gitignored)
│   ├── instructions.md      # Project instructions
│   └── plugins/             # Local plugins
├── CLAW.md                  # Main instruction file
├── CLAW.local.md            # Local instructions (gitignored)
└── ...
```

### A.2 Permission Hierarchy

```
ReadOnly < WorkspaceWrite < DangerFullAccess < Prompt < Allow
```

### A.3 Hook Exit Codes

```
0 = Allow
2 = Deny
* = Warn (continue)
```

### A.4 Essential Traits

```rust
trait ApiClient {
    fn stream(&mut self, request: ApiRequest) -> Result<Vec<AssistantEvent>, RuntimeError>;
}

trait ToolExecutor {
    fn execute(&mut self, tool_name: &str, input: &str) -> Result<String, ToolError>;
}

trait PermissionPrompter {
    fn decide(&mut self, request: &PermissionRequest) -> PermissionPromptDecision;
}
```

---

## Appendix B: Checklist Thiết Kế Agent System

### B.1 Core Components

- [ ] ConversationRuntime với session, api_client, tool_executor
- [ ] Session persistence (JSON format, versioned schema)
- [ ] Tool registry với schemas và permission levels
- [ ] Permission system với configurable modes
- [ ] Usage tracking (tokens, costs)

### B.2 Extensibility

- [ ] Hook system (PreToolUse, PostToolUse)
- [ ] Plugin architecture (tools, commands, hooks)
- [ ] MCP support cho external tool servers
- [ ] Configuration layering (user/project/local)

### B.3 UX/CLI

- [ ] Slash commands (/help, /status, /model, ...)
- [ ] Session resume support
- [ ] Streaming output rendering
- [ ] Interactive permission prompts

### B.4 Safety

- [ ] Iteration limits cho conversation loop
- [ ] Permission checks before tool execution
- [ ] Graceful error handling
- [ ] Input validation via schemas

---

*Document generated by analyzing Claw Code source. Last updated: 2026-04-08*
