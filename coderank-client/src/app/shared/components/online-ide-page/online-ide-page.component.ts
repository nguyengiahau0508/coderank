import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MenuItem, MessageService } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { MonacoEditorModule, NgxEditorModel } from 'ngx-monaco-editor-v2-alternative';
import { AuthService } from '../../../core/services/auth.service';
import {
  ProgrammingLanguageEnum,
  RunResult,
  RunnerApi,
  RunStatusEnum,
} from '../../../data';

interface IdeFile {
  path: string;
  content: string;
}

interface IdeProject {
  id: string;
  name: string;
  templateId: string;
  description: string;
  files: IdeFile[];
  folders: string[];
  scripts: string[];
  dependencies: string[];
  entryFilePath: string;
  createdAt: string;
  updatedAt: string;
}

interface IdeProjectTemplate {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  accentClass: string;
  icon: string;
  files: IdeFile[];
  folders: string[];
  scripts: string[];
  dependencies: string[];
  entryFilePath: string;
}

interface ExplorerRow {
  path: string;
  name: string;
  type: 'folder' | 'file';
  depth: number;
  isOpen?: boolean;
}

interface PersistedIdeWorkspace {
  projects: IdeProject[];
  activeProjectId: string | null;
  activeFilePath: string | null;
  openFilePaths: string[];
  folderOpenState: Record<string, boolean>;
}

@Component({
  selector: 'app-online-ide-page',
  standalone: true,
  imports: [
    FormsModule,
    ContextMenu,
    Dialog,
    Toast,
    MonacoEditorModule,
  ],
  providers: [MessageService],
  templateUrl: './online-ide-page.component.html',
  styleUrls: ['./online-ide-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnlineIdePageComponent implements OnDestroy {
  private static readonly STORAGE_NAMESPACE = 'coderank_online_ide_workspace_v3';

  private readonly runnerApi = inject(RunnerApi);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);

  readonly projectTemplates: IdeProjectTemplate[] = IDE_PROJECT_TEMPLATES;

  readonly projects = signal<IdeProject[]>([]);
  readonly activeProjectId = signal<string | null>(null);
  readonly activeFilePath = signal<string | null>(null);
  readonly openFilePaths = signal<string[]>([]);
  readonly selectedExplorerPath = signal<string | null>(null);
  readonly folderOpenState = signal<Record<string, boolean>>({});

  readonly showCreateProjectDialog = signal(false);
  readonly newProjectName = signal('');
  readonly selectedTemplateId = signal(this.projectTemplates[0].id);

  readonly showCreateItemDialog = signal(false);
  readonly createItemType = signal<'file' | 'folder'>('file');
  readonly createItemName = signal('');

  readonly stdin = signal('');
  readonly isRunning = signal(false);
  readonly result = signal<RunResult | null>(null);
  readonly hasExecuted = signal(false);

  readonly terminalCommand = signal('');
  readonly terminalLogs = signal<string[]>([]);
  readonly contextMenuTargetType = signal<'file' | 'folder' | null>(null);
  readonly terminalPrompt = computed(() => {
    const activeId = this.activeProjectId();
    const projectName =
      this.projects().find(project => project.id === activeId)?.name ?? 'workspace';
    const normalized = projectName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    return `coderank@${normalized || 'workspace'}:~$`;
  });
  readonly explorerContextMenuItems = computed<MenuItem[]>(() => {
    const targetType = this.contextMenuTargetType();
    if (!targetType) return [];

    return [
      {
        label: targetType === 'file' ? 'Xóa file' : 'Xóa thư mục',
        icon: 'pi pi-trash',
        command: () => this.deleteSelectedPath(),
      },
    ];
  });

  readonly editorOptions = {
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
  };
  editorModel: NgxEditorModel = {
    value: '',
    language: 'javascript',
  };
  editorValue = '';
  private readonly loadedEditorModelKey = signal<string | null>(null);
  @ViewChild('explorerContextMenu') private explorerContextMenu?: ContextMenu;
  private readonly terminalTimers = new Set<ReturnType<typeof setTimeout>>();

  readonly activeProject = computed(() => {
    const activeId = this.activeProjectId();
    if (!activeId) return null;
    return this.projects().find(project => project.id === activeId) ?? null;
  });
  readonly hasProjects = computed(() => this.projects().length > 0);

  readonly activeFile = computed(() => {
    const project = this.activeProject();
    const activePath = this.activeFilePath();
    if (!project || !activePath) return null;
    return project.files.find(file => file.path === activePath) ?? null;
  });

  readonly explorerRows = computed(() => {
    const project = this.activeProject();
    if (!project) return [];
    return this.buildExplorerRows(project, this.folderOpenState());
  });

  readonly currentProjectFileCount = computed(() => this.activeProject()?.files.length ?? 0);
  readonly currentProjectFolderCount = computed(
    () => this.collectAllFolders(this.activeProject()).length
  );
  readonly currentProjectLineCount = computed(() =>
    (this.activeProject()?.files ?? []).reduce(
      (sum, file) => sum + this.countLines(file.content),
      0
    )
  );

  readonly activeFileStats = computed(() => {
    const file = this.activeFile();
    if (!file) {
      return {
        language: '-',
        lines: 0,
        chars: 0,
      };
    }

    return {
      language: this.resolveMonacoLanguage(file.path),
      lines: this.countLines(file.content),
      chars: file.content.length,
    };
  });

  constructor() {
    this.bootstrapWorkspace();

    effect(() => {
      const project = this.activeProject();
      const activePath = this.activeFilePath();
      const modelKey = project && activePath ? `${project.id}:${activePath}` : null;

      if (!modelKey) {
        if (this.loadedEditorModelKey() !== null) {
          this.editorValue = '';
          this.editorModel = {
            value: '',
            language: 'plaintext',
          };
          this.loadedEditorModelKey.set(null);
        }
        return;
      }

      if (this.loadedEditorModelKey() === modelKey) {
        return;
      }

      const file = project?.files.find(item => item.path === activePath);
      if (!file) return;

      this.editorValue = file.content;
      this.editorModel = {
        value: file.content,
        language: this.resolveMonacoLanguage(file.path),
      };
      this.loadedEditorModelKey.set(modelKey);
    });

    effect(() => {
      const snapshot: PersistedIdeWorkspace = {
        projects: this.projects(),
        activeProjectId: this.activeProjectId(),
        activeFilePath: this.activeFilePath(),
        openFilePaths: this.openFilePaths(),
        folderOpenState: this.folderOpenState(),
      };
      this.persistWorkspace(snapshot);
    });
  }

  ngOnDestroy(): void {
    this.clearTerminalTimers();
  }

  openCreateProjectDialog(): void {
    this.newProjectName.set('');
    this.selectedTemplateId.set(this.projectTemplates[0].id);
    this.showCreateProjectDialog.set(true);
  }

  createProject(): void {
    const template = this.projectTemplates.find(
      item => item.id === this.selectedTemplateId()
    );
    if (!template) return;

    const customName = this.newProjectName().trim();
    const projectName = customName.length > 0
      ? customName
      : template.id === 'empty-project'
        ? 'My Custom Project'
        : `${template.name} Playground`;
    const project = this.instantiateProject(template, projectName);

    this.projects.update(items => [project, ...items]);
    this.setActiveProject(project.id);
    this.showCreateProjectDialog.set(false);
    this.newProjectName.set('');
    this.messageService.add({
      severity: 'success',
      summary: 'Đã tạo project',
      detail: `Project "${project.name}" đã sẵn sàng.`,
      life: 1800,
    });
  }

  setActiveProject(projectId: string): void {
    const current = this.projects().find(project => project.id === projectId);
    if (!current) return;

    this.activeProjectId.set(projectId);
    this.syncProjectView(current);
    this.resetTerminal(current.name);
  }

  deleteCurrentProject(): void {
    const current = this.activeProject();
    if (!current) return;

    const confirmed = confirm(
      `Bạn có chắc muốn xóa project "${current.name}" không?`
    );
    if (!confirmed) return;

    this.projects.update(items => items.filter(project => project.id !== current.id));
    const nextProjects = this.projects();

    if (nextProjects.length === 0) {
      this.clearProjectView();
      return;
    }

    this.setActiveProject(nextProjects[0].id);
    this.messageService.add({
      severity: 'success',
      summary: 'Đã xóa project',
      detail: `Project "${current.name}" đã được xóa.`,
      life: 1600,
    });
  }

  openCreateItemDialog(type: 'file' | 'folder'): void {
    this.createItemType.set(type);
    this.createItemName.set('');
    this.showCreateItemDialog.set(true);
  }

  createItem(): void {
    const project = this.activeProject();
    if (!project) return;

    const rawName = this.createItemName().trim();
    if (!rawName) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Thiếu tên',
        detail: 'Vui lòng nhập tên file hoặc folder.',
      });
      return;
    }

    const safeName = this.normalizePath(rawName);
    if (!safeName || safeName.includes('..')) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Tên không hợp lệ',
        detail: 'Tên không được chứa ".." hoặc ký tự đường dẫn không hợp lệ.',
      });
      return;
    }

    const parentFolder = this.getSelectedFolderPath(project);
    const fullPath = parentFolder ? `${parentFolder}/${safeName}` : safeName;
    const exists = this.pathExists(project, fullPath);
    if (exists) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Trùng tên',
        detail: 'Đường dẫn này đã tồn tại trong project.',
      });
      return;
    }

    if (this.createItemType() === 'folder') {
      const normalizedFolder = this.normalizePath(fullPath);
      this.updateActiveProject(current => {
        const folderSet = new Set(current.folders);
        this.collectParentChain(normalizedFolder).forEach(folder => {
          if (folder) folderSet.add(folder);
        });
        return {
          ...current,
          folders: Array.from(folderSet),
        };
      });
      this.folderOpenState.update(state => ({
        ...state,
        [normalizedFolder]: true,
      }));
      this.selectedExplorerPath.set(normalizedFolder);
    } else {
      const normalizedFile = this.normalizePath(fullPath);
      this.updateActiveProject(current => {
        const folderSet = new Set(current.folders);
        this.collectParentChain(this.getParentPath(normalizedFile)).forEach(folder => {
          if (folder) folderSet.add(folder);
        });
        return {
          ...current,
          folders: Array.from(folderSet),
          files: [
            ...current.files,
            { path: normalizedFile, content: this.getStarterContent(normalizedFile) },
          ],
        };
      });
      this.openFile(normalizedFile);
    }

    this.showCreateItemDialog.set(false);
    this.createItemName.set('');
  }

  renameSelectedPath(): void {
    const project = this.activeProject();
    const selectedPath = this.selectedExplorerPath();
    if (!project || !selectedPath) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Chưa chọn mục',
        detail: 'Vui lòng chọn file hoặc folder trước khi đổi tên.',
      });
      return;
    }

    const currentName = this.getBaseName(selectedPath);
    const newName = prompt('Nhập tên mới:', currentName)?.trim();
    if (!newName || newName === currentName) return;

    const safeName = this.normalizePath(newName);
    if (!safeName || safeName.includes('/')) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Tên không hợp lệ',
        detail: 'Tên mới không được chứa ký tự "/".',
      });
      return;
    }

    const parent = this.getParentPath(selectedPath);
    const nextPath = parent ? `${parent}/${safeName}` : safeName;
    if (this.pathExists(project, nextPath)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Trùng tên',
        detail: 'Tên mới đã tồn tại trong thư mục hiện tại.',
      });
      return;
    }

    const isFile = project.files.some(file => file.path === selectedPath);
    if (isFile) {
      this.updateActiveProject(current => ({
        ...current,
        files: current.files.map(file =>
          file.path === selectedPath ? { ...file, path: nextPath } : file
        ),
      }));
      this.updatePathReferences(selectedPath, nextPath);
      return;
    }

    const isFolder = this.collectAllFolders(project).includes(selectedPath);
    if (!isFolder) return;

    this.updateActiveProject(current => ({
      ...current,
      folders: current.folders.map(folder =>
        this.isSameOrChildPath(folder, selectedPath)
          ? this.replacePathPrefix(folder, selectedPath, nextPath)
          : folder
      ),
      files: current.files.map(file =>
        this.isSameOrChildPath(file.path, selectedPath)
          ? { ...file, path: this.replacePathPrefix(file.path, selectedPath, nextPath) }
          : file
      ),
    }));
    this.updatePathReferences(selectedPath, nextPath);
    this.folderOpenState.update(state => {
      const nextState: Record<string, boolean> = {};
      Object.entries(state).forEach(([path, value]) => {
        if (this.isSameOrChildPath(path, selectedPath)) {
          nextState[this.replacePathPrefix(path, selectedPath, nextPath)] = value;
          return;
        }
        nextState[path] = value;
      });
      return nextState;
    });
  }

  deleteSelectedPath(): void {
    const project = this.activeProject();
    const selectedPath = this.selectedExplorerPath();
    if (!project || !selectedPath) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Chưa chọn mục',
        detail: 'Vui lòng chọn file hoặc folder để xóa.',
      });
      return;
    }

    const isFile = project.files.some(file => file.path === selectedPath);
    if (isFile) {
      const confirmed = confirm(`Xóa file "${selectedPath}"?`);
      if (!confirmed) return;

      this.updateActiveProject(current => ({
        ...current,
        files: current.files.filter(file => file.path !== selectedPath),
      }));
      this.afterFileStructureChanged();
      this.selectedExplorerPath.set(this.activeFilePath());
      return;
    }

    const isFolder = this.collectAllFolders(project).includes(selectedPath);
    if (!isFolder) return;

    const confirmed = confirm(`Xóa folder "${selectedPath}" và toàn bộ nội dung?`);
    if (!confirmed) return;

    this.updateActiveProject(current => ({
      ...current,
      folders: current.folders.filter(
        folder => !this.isSameOrChildPath(folder, selectedPath)
      ),
      files: current.files.filter(
        file => !this.isSameOrChildPath(file.path, selectedPath)
      ),
    }));
    this.folderOpenState.update(state => {
      const nextState: Record<string, boolean> = {};
      Object.entries(state).forEach(([path, value]) => {
        if (!this.isSameOrChildPath(path, selectedPath)) {
          nextState[path] = value;
        }
      });
      return nextState;
    });
    this.afterFileStructureChanged();
    this.selectedExplorerPath.set(this.activeFilePath());
  }

  onExplorerRowClick(row: ExplorerRow): void {
    this.selectedExplorerPath.set(row.path);
    if (row.type === 'file') {
      this.openFile(row.path);
      return;
    }
    this.toggleFolder(row.path);
  }

  onExplorerRowContextMenu(event: MouseEvent, row: ExplorerRow): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectedExplorerPath.set(row.path);
    this.contextMenuTargetType.set(row.type);
    this.explorerContextMenu?.show(event);
  }

  toggleFolder(path: string, event?: MouseEvent): void {
    event?.stopPropagation();
    this.folderOpenState.update(state => ({
      ...state,
      [path]: !(state[path] ?? true),
    }));
  }

  openFile(path: string): void {
    const project = this.activeProject();
    if (!project) return;

    const exists = project.files.some(file => file.path === path);
    if (!exists) return;

    this.openFilePaths.update(paths => (paths.includes(path) ? paths : [...paths, path]));
    this.activeFilePath.set(path);
    this.selectedExplorerPath.set(path);
    this.expandFolderChain(this.getParentPath(path));
  }

  activateTab(path: string): void {
    this.activeFilePath.set(path);
    this.selectedExplorerPath.set(path);
  }

  closeTab(path: string, event: MouseEvent): void {
    event.stopPropagation();
    const currentTabs = this.openFilePaths();
    if (!currentTabs.includes(path)) return;

    const nextTabs = currentTabs.filter(item => item !== path);
    this.openFilePaths.set(nextTabs);

    if (this.activeFilePath() === path) {
      this.activeFilePath.set(nextTabs[nextTabs.length - 1] ?? null);
    }

    if (!this.activeFilePath()) {
      this.afterFileStructureChanged();
    }
  }

  onEditorChange(content: string): void {
    const activePath = this.activeFilePath();
    if (!activePath) return;

    const current = this.activeFile();
    if (!current || current.content === content) return;

    this.updateActiveProject(project => ({
      ...project,
      files: project.files.map(file =>
        file.path === activePath ? { ...file, content } : file
      ),
    }));
  }

  runActiveFile(): void {
    const file = this.activeFile();
    if (!file) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Chưa mở file',
        detail: 'Vui lòng chọn file code để chạy.',
      });
      return;
    }

    if (!file.content.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'File rỗng',
        detail: 'Vui lòng nhập code trước khi chạy.',
      });
      return;
    }

    const runnableLanguage = this.resolveRunnableLanguage(file.path);
    if (!runnableLanguage) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Không hỗ trợ chạy trực tiếp',
        detail: 'Runner hiện chỉ hỗ trợ file code như .js, .ts, .py, .java, .cpp, .c, .go, .rs.',
      });
      return;
    }

    this.isRunning.set(true);
    this.hasExecuted.set(true);
    this.result.set(null);

    this.runnerApi
      .runCode({
        code: file.content,
        language: runnableLanguage,
        input: this.stdin(),
      })
      .pipe(finalize(() => this.isRunning.set(false)))
      .subscribe({
        next: response => {
          const runResult = response.data ?? null;
          this.result.set(runResult);
          this.appendTerminal([
            `$ run ${file.path}`,
            runResult
              ? `status=${runResult.status} time=${runResult.time}ms memory=${runResult.memory}KB`
              : 'runner returned empty result',
          ]);
        },
        error: () => {
          this.appendTerminal([`$ run ${file.path}`, 'runner connection failed']);
          this.messageService.add({
            severity: 'error',
            summary: 'Chạy code thất bại',
            detail: 'Không thể kết nối runner.',
          });
        },
      });
  }

  clearOutput(): void {
    this.result.set(null);
    this.hasExecuted.set(false);
  }

  clearInput(): void {
    this.stdin.set('');
  }

  runScript(script: string): void {
    this.terminalCommand.set(script);
    this.executeTerminalCommand();
  }

  executeTerminalCommand(): void {
    const command = this.terminalCommand().trim();
    if (!command) return;

    const normalized = command.toLowerCase();
    this.appendTerminal([`${this.terminalPrompt()} ${command}`]);
    this.terminalCommand.set('');

    if (normalized === 'clear') {
      this.clearTerminalTimers();
      this.terminalLogs.set([]);
      return;
    }

    if (normalized.includes('npm install')) {
      this.streamTerminalLines([
        'Resolving packages...',
        'Fetching package metadata...',
        'added 142 packages in 2.4s',
        'found 0 vulnerabilities',
      ]);
      return;
    }

    if (normalized.includes('npm run dev')) {
      this.streamTerminalLines([
        'Starting dev server...',
        '[watch] compiling...',
        'Local: http://localhost:3000',
        '[watch] ready in 365ms',
        'Hot reload enabled (UI mock mode)',
      ]);
      return;
    }

    if (normalized.includes('npm test')) {
      this.streamTerminalLines([
        'Running test suite...',
        '✓ unit/auth.spec.ts',
        '✓ unit/course.spec.ts',
        '8 passed, 0 failed (UI mock mode)',
      ]);
      return;
    }

    this.streamTerminalLines([
      `Command "${command}" captured in UI mode.`,
      'Runtime backend chưa kết nối ở phase này.',
    ]);
  }

  clearTerminalLogs(): void {
    this.clearTerminalTimers();
    this.terminalLogs.set([]);
  }

  getStatusLabel(status: RunStatusEnum): string {
    switch (status) {
      case RunStatusEnum.OK:
        return 'Success';
      case RunStatusEnum.TLE:
        return 'Time Limit Exceeded';
      case RunStatusEnum.MLE:
        return 'Memory Limit Exceeded';
      case RunStatusEnum.RE:
        return 'Runtime Error';
      case RunStatusEnum.CE:
        return 'Compilation Error';
      default:
        return 'Unknown';
    }
  }

  getStatusStyle(status: RunStatusEnum): string {
    switch (status) {
      case RunStatusEnum.OK:
        return 'background: rgba(63, 185, 80, 0.15); color: var(--cr-accent-green);';
      case RunStatusEnum.TLE:
      case RunStatusEnum.MLE:
        return 'background: rgba(210, 153, 34, 0.15); color: var(--cr-accent-yellow);';
      case RunStatusEnum.RE:
      case RunStatusEnum.CE:
        return 'background: rgba(248, 81, 73, 0.15); color: var(--cr-accent-red);';
      default:
        return 'background: var(--cr-bg-tertiary); color: var(--cr-text-muted);';
    }
  }

  formatOutput(output: string | undefined): string {
    if (!output) return '(empty)';
    return output;
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString('vi-VN', {
      hour12: false,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getBaseName(path: string): string {
    const normalized = this.normalizePath(path);
    const idx = normalized.lastIndexOf('/');
    return idx === -1 ? normalized : normalized.slice(idx + 1);
  }

  private bootstrapWorkspace(): void {
    const persisted = this.loadWorkspace();
    if (persisted) {
      this.projects.set(persisted.projects);
      this.folderOpenState.set(persisted.folderOpenState ?? {});
      const preferredId =
        persisted.activeProjectId && persisted.projects.some(p => p.id === persisted.activeProjectId)
          ? persisted.activeProjectId
          : persisted.projects[0]?.id ?? null;
      this.activeProjectId.set(preferredId);
      if (preferredId) {
        const project = persisted.projects.find(item => item.id === preferredId);
        if (project) {
          this.syncProjectView(
            project,
            persisted.activeFilePath ?? undefined,
            persisted.openFilePaths ?? []
          );
          this.resetTerminal(project.name);
        }
      } else {
        this.clearProjectView();
      }
      return;
    }

    this.projects.set([]);
    this.clearProjectView();
  }

  private instantiateProject(template: IdeProjectTemplate, name: string): IdeProject {
    const now = new Date().toISOString();
    return {
      id: this.createId('project'),
      name,
      templateId: template.id,
      description: template.description,
      files: template.files.map(file => ({ ...file })),
      folders: [...template.folders],
      scripts: [...template.scripts],
      dependencies: [...template.dependencies],
      entryFilePath: template.entryFilePath,
      createdAt: now,
      updatedAt: now,
    };
  }

  private syncProjectView(
    project: IdeProject,
    preferredActivePath?: string,
    preferredTabs?: string[]
  ): void {
    const validPaths = new Set(project.files.map(file => file.path));
    const tabs = (preferredTabs ?? []).filter(path => validPaths.has(path));

    if (!tabs.length) {
      const defaultPath = validPaths.has(project.entryFilePath)
        ? project.entryFilePath
        : project.files[0]?.path;
      if (defaultPath) {
        tabs.push(defaultPath);
      }
    }

    let activePath: string | null = null;
    if (preferredActivePath && validPaths.has(preferredActivePath)) {
      activePath = preferredActivePath;
    } else if (tabs.length > 0) {
      activePath = tabs[0];
    }

    this.openFilePaths.set(tabs);
    this.activeFilePath.set(activePath);
    this.selectedExplorerPath.set(activePath);
    if (activePath) {
      this.expandFolderChain(this.getParentPath(activePath));
    }
  }

  private updateActiveProject(mutator: (project: IdeProject) => IdeProject): void {
    const activeId = this.activeProjectId();
    if (!activeId) return;

    this.projects.update(projects =>
      projects.map(project => {
        if (project.id !== activeId) return project;
        return {
          ...mutator(project),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }

  private afterFileStructureChanged(): void {
    const project = this.activeProject();
    if (!project) {
      this.openFilePaths.set([]);
      this.activeFilePath.set(null);
      return;
    }

    const validPaths = new Set(project.files.map(file => file.path));
    let tabs = this.openFilePaths().filter(path => validPaths.has(path));
    if (!tabs.length && project.files.length > 0) {
      const fallback = validPaths.has(project.entryFilePath)
        ? project.entryFilePath
        : project.files[0].path;
      tabs = [fallback];
    }
    this.openFilePaths.set(tabs);

    const currentActive = this.activeFilePath();
    if (currentActive && validPaths.has(currentActive)) return;
    this.activeFilePath.set(tabs[0] ?? null);
  }

  private updatePathReferences(previousPath: string, nextPath: string): void {
    this.openFilePaths.update(paths =>
      paths.map(path =>
        this.isSameOrChildPath(path, previousPath)
          ? this.replacePathPrefix(path, previousPath, nextPath)
          : path
      )
    );
    this.activeFilePath.update(path =>
      path && this.isSameOrChildPath(path, previousPath)
        ? this.replacePathPrefix(path, previousPath, nextPath)
        : path
    );
    this.selectedExplorerPath.update(path =>
      path && this.isSameOrChildPath(path, previousPath)
        ? this.replacePathPrefix(path, previousPath, nextPath)
        : path
    );
  }

  private buildExplorerRows(
    project: IdeProject,
    openState: Record<string, boolean>
  ): ExplorerRow[] {
    const rows: ExplorerRow[] = [];
    const allFolders = this.collectAllFolders(project);

    const folderChildren = new Map<string, string[]>();
    const fileChildren = new Map<string, IdeFile[]>();

    const ensureFolderEntry = (path: string): void => {
      if (!folderChildren.has(path)) folderChildren.set(path, []);
      if (!fileChildren.has(path)) fileChildren.set(path, []);
    };

    ensureFolderEntry('');

    allFolders.forEach(folder => {
      const parent = this.getParentPath(folder);
      ensureFolderEntry(parent);
      ensureFolderEntry(folder);
      folderChildren.get(parent)?.push(folder);
    });

    project.files.forEach(file => {
      const parent = this.getParentPath(file.path);
      ensureFolderEntry(parent);
      fileChildren.get(parent)?.push(file);
    });

    const walk = (folder: string, depth: number): void => {
      const childrenFolders = [...(folderChildren.get(folder) ?? [])].sort((a, b) =>
        this.getBaseName(a).localeCompare(this.getBaseName(b))
      );
      const childrenFiles = [...(fileChildren.get(folder) ?? [])].sort((a, b) =>
        this.getBaseName(a.path).localeCompare(this.getBaseName(b.path))
      );

      childrenFolders.forEach(childFolder => {
        const opened = openState[childFolder] ?? true;
        rows.push({
          path: childFolder,
          name: this.getBaseName(childFolder),
          type: 'folder',
          depth,
          isOpen: opened,
        });
        if (opened) {
          walk(childFolder, depth + 1);
        }
      });

      childrenFiles.forEach(file => {
        rows.push({
          path: file.path,
          name: this.getBaseName(file.path),
          type: 'file',
          depth,
        });
      });
    };

    walk('', 0);

    return rows;
  }

  private collectAllFolders(project: IdeProject | null): string[] {
    if (!project) return [];
    const folderSet = new Set(project.folders.map(folder => this.normalizePath(folder)));
    project.files.forEach(file => {
      this.collectParentChain(this.getParentPath(file.path)).forEach(folder => {
        if (folder) folderSet.add(folder);
      });
    });
    return Array.from(folderSet).filter(Boolean);
  }

  private getSelectedFolderPath(project: IdeProject): string {
    const selected = this.selectedExplorerPath();
    if (!selected) return '';

    const folders = this.collectAllFolders(project);
    if (folders.includes(selected)) return selected;

    const fileExists = project.files.some(file => file.path === selected);
    if (fileExists) return this.getParentPath(selected);

    return '';
  }

  private pathExists(project: IdeProject, path: string): boolean {
    const normalized = this.normalizePath(path);
    const folderExists = this.collectAllFolders(project).includes(normalized);
    const fileExists = project.files.some(file => file.path === normalized);
    return folderExists || fileExists;
  }

  private expandFolderChain(folderPath: string): void {
    const chain = this.collectParentChain(folderPath);
    if (!chain.length) return;

    this.folderOpenState.update(state => {
      const nextState = { ...state };
      chain.forEach(folder => {
        nextState[folder] = true;
      });
      return nextState;
    });
  }

  private collectParentChain(path: string): string[] {
    const chain: string[] = [];
    let cursor = this.normalizePath(path);
    while (cursor) {
      chain.push(cursor);
      cursor = this.getParentPath(cursor);
    }
    return chain.reverse();
  }

  private replacePathPrefix(path: string, from: string, to: string): string {
    if (path === from) return to;
    return `${to}${path.slice(from.length)}`;
  }

  private isSameOrChildPath(path: string, parent: string): boolean {
    return path === parent || path.startsWith(`${parent}/`);
  }

  private resolveRunnableLanguage(path: string): ProgrammingLanguageEnum | null {
    const lower = path.toLowerCase();
    if (lower.endsWith('.ts')) return ProgrammingLanguageEnum.TypeScript;
    if (lower.endsWith('.js') || lower.endsWith('.mjs')) {
      return ProgrammingLanguageEnum.JavaScript;
    }
    if (lower.endsWith('.py')) return ProgrammingLanguageEnum.Python;
    if (lower.endsWith('.java')) return ProgrammingLanguageEnum.Java;
    if (
      lower.endsWith('.cpp') ||
      lower.endsWith('.cc') ||
      lower.endsWith('.cxx') ||
      lower.endsWith('.hpp')
    ) {
      return ProgrammingLanguageEnum.CPlusPlus;
    }
    if (lower.endsWith('.c')) return ProgrammingLanguageEnum.C;
    if (lower.endsWith('.go')) return ProgrammingLanguageEnum.Go;
    if (lower.endsWith('.rs')) return ProgrammingLanguageEnum.Rust;
    return null;
  }

  private resolveMonacoLanguage(path: string): string {
    const lower = path.toLowerCase();
    if (lower.endsWith('.ts')) return 'typescript';
    if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) {
      return 'javascript';
    }
    if (lower.endsWith('.json')) return 'json';
    if (lower.endsWith('.md')) return 'markdown';
    if (lower.endsWith('.html')) return 'html';
    if (lower.endsWith('.css')) return 'css';
    if (lower.endsWith('.py')) return 'python';
    if (lower.endsWith('.java')) return 'java';
    if (lower.endsWith('.cpp') || lower.endsWith('.cc') || lower.endsWith('.cxx')) {
      return 'cpp';
    }
    if (lower.endsWith('.c') || lower.endsWith('.h')) return 'c';
    if (lower.endsWith('.go')) return 'go';
    if (lower.endsWith('.rs')) return 'rust';
    if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'yaml';
    return 'plaintext';
  }

  private getStarterContent(path: string): string {
    const lower = path.toLowerCase();
    if (lower.endsWith('.ts')) {
      return `export function main(): void {\n  console.log('Hello TypeScript');\n}\n\nmain();\n`;
    }
    if (lower.endsWith('.js')) {
      return `function main() {\n  console.log('Hello JavaScript');\n}\n\nmain();\n`;
    }
    if (lower.endsWith('.py')) {
      return `def main():\n    print("Hello Python")\n\n\nif __name__ == "__main__":\n    main()\n`;
    }
    if (lower.endsWith('.md')) {
      return '# New document\n\nStart writing here...\n';
    }
    if (lower.endsWith('.json')) {
      return '{\n  "name": "new-file"\n}\n';
    }
    return '';
  }

  private appendTerminal(lines: string[]): void {
    this.terminalLogs.update(current => [...current, ...lines].slice(-250));
  }

  private streamTerminalLines(lines: string[]): void {
    lines.forEach((line, index) => {
      const timer = setTimeout(() => {
        this.appendTerminal([line]);
        this.terminalTimers.delete(timer);
      }, (index + 1) * 170);
      this.terminalTimers.add(timer);
    });
  }

  private clearTerminalTimers(): void {
    this.terminalTimers.forEach(timer => clearTimeout(timer));
    this.terminalTimers.clear();
  }

  private resetTerminal(projectName: string): void {
    this.clearTerminalTimers();
    this.terminalLogs.set([
      `$ workspace open ${projectName}`,
      'UI mode ready. Runtime backend will be connected later.',
    ]);
  }

  private persistWorkspace(snapshot: PersistedIdeWorkspace): void {
    if (!this.canUseLocalStorage()) return;
    const storageKey = this.getStorageKey();
    localStorage.setItem(
      storageKey,
      JSON.stringify(snapshot)
    );
  }

  private loadWorkspace(): PersistedIdeWorkspace | null {
    if (!this.canUseLocalStorage()) return null;
    const storageKey = this.getStorageKey();
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as PersistedIdeWorkspace;
      if (!Array.isArray(parsed.projects)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  private clearProjectView(): void {
    this.activeProjectId.set(null);
    this.activeFilePath.set(null);
    this.openFilePaths.set([]);
    this.selectedExplorerPath.set(null);
    this.terminalLogs.set([
      '$ workspace idle',
      'Tạo project đầu tiên của bạn để bắt đầu coding.',
    ]);
  }

  private canUseLocalStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private getStorageKey(): string {
    const currentUser = this.authService.currentUser();
    const userIdentity = currentUser?.id ?? currentUser?.email ?? 'anonymous';
    return `${OnlineIdePageComponent.STORAGE_NAMESPACE}:${userIdentity}`;
  }

  private normalizePath(path: string): string {
    return path
      .replace(/\\/g, '/')
      .replace(/^\/+|\/+$/g, '')
      .replace(/\/{2,}/g, '/');
  }

  private getParentPath(path: string): string {
    const normalized = this.normalizePath(path);
    const idx = normalized.lastIndexOf('/');
    return idx === -1 ? '' : normalized.slice(0, idx);
  }

  private countLines(content: string): number {
    if (!content) return 0;
    return content.split('\n').length;
  }

  private createId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  }
}

const IDE_PROJECT_TEMPLATES: IdeProjectTemplate[] = [
  {
    id: 'empty-project',
    name: 'Empty Project',
    subtitle: 'Custom from scratch',
    description:
      'Project rỗng để bạn tự tạo cấu trúc file/folder theo nhu cầu riêng.',
    accentClass: 'from-slate-500 to-zinc-500',
    icon: 'pi pi-folder-open',
    folders: [],
    files: [],
    scripts: [],
    dependencies: [],
    entryFilePath: '',
  },
  {
    id: 'node-cli',
    name: 'Node.js CLI',
    subtitle: 'JavaScript starter',
    description:
      'Template cho dự án Node.js script/CLI đơn giản với cấu trúc gọn nhẹ.',
    accentClass: 'from-emerald-500 to-teal-500',
    icon: 'pi pi-bolt',
    folders: ['lib'],
    files: [
      {
        path: 'package.json',
        content: `{
  "name": "node-cli-playground",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "test": "node --test"
  }
}
`,
      },
      {
        path: 'index.js',
        content: `import { sum } from './lib/math.js';

function main() {
  const result = sum(21, 21);
  console.log('Node CLI is ready.');
  console.log('21 + 21 =', result);
}

main();
`,
      },
      {
        path: 'lib/math.js',
        content: `export function sum(a, b) {
  return a + b;
}
`,
      },
      {
        path: 'README.md',
        content: `# Node CLI Playground

## Commands

- npm install
- npm run dev
- npm run test
`,
      },
    ],
    scripts: ['npm install', 'npm run dev', 'npm test'],
    dependencies: ['node >= 18'],
    entryFilePath: 'index.js',
  },
  {
    id: 'node-express',
    name: 'Node + Express API',
    subtitle: 'REST API starter',
    description:
      'Template backend Express cơ bản với route health-check và cấu trúc src.',
    accentClass: 'from-sky-500 to-indigo-500',
    icon: 'pi pi-server',
    folders: ['src', 'src/routes', 'src/middlewares'],
    files: [
      {
        path: 'package.json',
        content: `{
  "name": "express-api-playground",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^4.21.2"
  }
}
`,
      },
      {
        path: 'src/server.js',
        content: `import express from 'express';
import { healthRouter } from './routes/health.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/health', healthRouter);

app.listen(port, () => {
  console.log(\`API running on http://localhost:\${port}\`);
});
`,
      },
      {
        path: 'src/routes/health.js',
        content: `import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'express-api-playground',
    timestamp: new Date().toISOString()
  });
});
`,
      },
      {
        path: '.env.example',
        content: `PORT=3000
NODE_ENV=development
`,
      },
    ],
    scripts: ['npm install', 'npm run dev', 'npm run start'],
    dependencies: ['express', 'node >= 18'],
    entryFilePath: 'src/server.js',
  },
  {
    id: 'node-typescript',
    name: 'Node + TypeScript',
    subtitle: 'TS runtime starter',
    description:
      'Template TypeScript cho Node với tsconfig, source rõ ràng và scripts chuẩn.',
    accentClass: 'from-violet-500 to-fuchsia-500',
    icon: 'pi pi-code',
    folders: ['src'],
    files: [
      {
        path: 'package.json',
        content: `{
  "name": "node-ts-playground",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "tsx": "^4.19.2"
  }
}
`,
      },
      {
        path: 'tsconfig.json',
        content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "outDir": "dist",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
`,
      },
      {
        path: 'src/index.ts',
        content: `function bootstrap(): void {
  const now = new Date().toISOString();
  console.log('TypeScript project ready at', now);
}

bootstrap();
`,
      },
    ],
    scripts: ['npm install', 'npm run dev', 'npm run build'],
    dependencies: ['typescript', 'tsx', 'node >= 18'],
    entryFilePath: 'src/index.ts',
  },
];
