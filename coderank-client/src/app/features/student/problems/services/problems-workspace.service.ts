import { Injectable, signal } from '@angular/core';
import { DifficultyEnum, ProgrammingLanguageEnum } from '../../../../data';

export type ProblemListViewMode = 'list' | 'card';
export type ProblemListQuickStatus = 'all' | 'favorites' | 'solved' | 'unsolved';
export type ProblemListSort =
  | 'newest'
  | 'oldest'
  | 'points-desc'
  | 'points-asc'
  | 'difficulty-asc'
  | 'difficulty-desc'
  | 'title-asc'
  | 'title-desc';
export type WorkspaceSplitMode = '40-60' | '50-50' | '60-40';

export interface ProblemListPreset {
  id: string;
  name: string;
  searchTerm: string;
  difficulty: DifficultyEnum | null;
  tags: number[];
  pointsRange: [number, number];
  quickStatus: ProblemListQuickStatus;
  sort: ProblemListSort;
}

interface ProblemWorkspacePreferences {
  viewMode: ProblemListViewMode;
  showAdvancedFilters: boolean;
  sort: ProblemListSort;
  splitMode: WorkspaceSplitMode;
}

interface RecentProblemItem {
  problemId: number;
  title: string;
  viewedAt: number;
}

interface DraftCodeMap {
  [problemLanguageKey: string]: string;
}

const WORKSPACE_PREFERENCES_KEY = 'student_problems_workspace_preferences_v1';
const FAVORITES_KEY = 'student_problems_favorites_v1';
const RECENT_PROBLEMS_KEY = 'student_problems_recent_v1';
const FILTER_PRESETS_KEY = 'student_problems_filter_presets_v1';
const DRAFTS_KEY = 'student_problems_drafts_v1';
const SOLVED_KEY = 'student_problems_solved_v1';
const MAX_RECENT_ITEMS = 20;

@Injectable({ providedIn: 'root' })
export class ProblemsWorkspaceService {
  readonly preferences = signal<ProblemWorkspacePreferences>(this.readPreferences());
  readonly favoriteIds = signal<Set<number>>(new Set(this.readFavorites()));
  readonly recentProblems = signal<RecentProblemItem[]>(this.readRecentProblems());
  readonly solvedIds = signal<Set<number>>(new Set(this.readSolvedIds()));
  readonly presets = signal<ProblemListPreset[]>(this.readPresets());
  readonly drafts = signal<DraftCodeMap>(this.readDrafts());

  setViewMode(viewMode: ProblemListViewMode): void {
    this.updatePreferences({ viewMode });
  }

  setShowAdvancedFilters(showAdvancedFilters: boolean): void {
    this.updatePreferences({ showAdvancedFilters });
  }

  setSort(sort: ProblemListSort): void {
    this.updatePreferences({ sort });
  }

  setSplitMode(splitMode: WorkspaceSplitMode): void {
    this.updatePreferences({ splitMode });
  }

  toggleFavorite(problemId: number): void {
    this.favoriteIds.update(current => {
      const next = new Set(current);
      if (next.has(problemId)) {
        next.delete(problemId);
      } else {
        next.add(problemId);
      }
      this.writeFavorites([...next]);
      return next;
    });
  }

  isFavorite(problemId: number): boolean {
    return this.favoriteIds().has(problemId);
  }

  addRecent(problemId: number, title: string): void {
    this.recentProblems.update(current => {
      const withoutCurrent = current.filter(item => item.problemId !== problemId);
      const next: RecentProblemItem[] = [
        { problemId, title, viewedAt: Date.now() },
        ...withoutCurrent,
      ].slice(0, MAX_RECENT_ITEMS);
      this.writeRecentProblems(next);
      return next;
    });
  }

  markSolved(problemId: number): void {
    this.solvedIds.update(current => {
      const next = new Set(current);
      next.add(problemId);
      this.writeSolvedIds([...next]);
      return next;
    });
  }

  isSolved(problemId: number): boolean {
    return this.solvedIds().has(problemId);
  }

  savePreset(preset: Omit<ProblemListPreset, 'id'>): void {
    const item: ProblemListPreset = {
      ...preset,
      id: `preset_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
    this.presets.update(current => {
      const next = [item, ...current];
      this.writePresets(next);
      return next;
    });
  }

  removePreset(id: string): void {
    this.presets.update(current => {
      const next = current.filter(item => item.id !== id);
      this.writePresets(next);
      return next;
    });
  }

  clearPresets(): void {
    this.presets.set([]);
    this.writePresets([]);
  }

  saveDraft(problemId: number, language: ProgrammingLanguageEnum, code: string): void {
    const key = this.getDraftKey(problemId, language);
    this.drafts.update(current => {
      const next = { ...current, [key]: code };
      this.writeDrafts(next);
      return next;
    });
  }

  getDraft(problemId: number, language: ProgrammingLanguageEnum): string | null {
    const key = this.getDraftKey(problemId, language);
    const value = this.drafts()[key];
    return typeof value === 'string' ? value : null;
  }

  private getDraftKey(problemId: number, language: ProgrammingLanguageEnum): string {
    return `${problemId}_${language}`;
  }

  private updatePreferences(partial: Partial<ProblemWorkspacePreferences>): void {
    this.preferences.update(current => {
      const next = { ...current, ...partial };
      this.writePreferences(next);
      return next;
    });
  }

  private readPreferences(): ProblemWorkspacePreferences {
    const fallback: ProblemWorkspacePreferences = {
      viewMode: 'list',
      showAdvancedFilters: false,
      sort: 'newest',
      splitMode: '50-50',
    };
    const parsed = this.readJson<Partial<ProblemWorkspacePreferences>>(WORKSPACE_PREFERENCES_KEY);
    if (!parsed) return fallback;

    return {
      viewMode: parsed.viewMode === 'card' ? 'card' : 'list',
      showAdvancedFilters: Boolean(parsed.showAdvancedFilters),
      sort: this.isSort(parsed.sort) ? parsed.sort : 'newest',
      splitMode: this.isSplitMode(parsed.splitMode) ? parsed.splitMode : '50-50',
    };
  }

  private readFavorites(): number[] {
    const parsed = this.readJson<unknown>(FAVORITES_KEY);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(v => typeof v === 'number');
  }

  private readRecentProblems(): RecentProblemItem[] {
    const parsed = this.readJson<unknown>(RECENT_PROBLEMS_KEY);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((v): v is RecentProblemItem =>
        !!v &&
        typeof v === 'object' &&
        typeof (v as RecentProblemItem).problemId === 'number' &&
        typeof (v as RecentProblemItem).title === 'string' &&
        typeof (v as RecentProblemItem).viewedAt === 'number'
      )
      .slice(0, MAX_RECENT_ITEMS);
  }

  private readPresets(): ProblemListPreset[] {
    const parsed = this.readJson<unknown>(FILTER_PRESETS_KEY);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((v): v is ProblemListPreset => {
      if (!v || typeof v !== 'object') return false;
      const item = v as ProblemListPreset;
      return (
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.searchTerm === 'string' &&
        (item.difficulty === null || item.difficulty === DifficultyEnum.Easy || item.difficulty === DifficultyEnum.Medium || item.difficulty === DifficultyEnum.Hard) &&
        Array.isArray(item.tags) &&
        Array.isArray(item.pointsRange) &&
        item.pointsRange.length === 2 &&
        typeof item.pointsRange[0] === 'number' &&
        typeof item.pointsRange[1] === 'number' &&
        this.isQuickStatus(item.quickStatus) &&
        this.isSort(item.sort)
      );
    });
  }

  private readSolvedIds(): number[] {
    const parsed = this.readJson<unknown>(SOLVED_KEY);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(v => typeof v === 'number');
  }

  private readDrafts(): DraftCodeMap {
    const parsed = this.readJson<unknown>(DRAFTS_KEY);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const result: DraftCodeMap = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'string') {
        result[key] = value;
      }
    }
    return result;
  }

  private writePreferences(value: ProblemWorkspacePreferences): void {
    this.writeJson(WORKSPACE_PREFERENCES_KEY, value);
  }

  private writeFavorites(value: number[]): void {
    this.writeJson(FAVORITES_KEY, value);
  }

  private writeRecentProblems(value: RecentProblemItem[]): void {
    this.writeJson(RECENT_PROBLEMS_KEY, value);
  }

  private writePresets(value: ProblemListPreset[]): void {
    this.writeJson(FILTER_PRESETS_KEY, value);
  }

  private writeDrafts(value: DraftCodeMap): void {
    this.writeJson(DRAFTS_KEY, value);
  }

  private writeSolvedIds(value: number[]): void {
    this.writeJson(SOLVED_KEY, value);
  }

  private readJson<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private writeJson(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private isQuickStatus(value: unknown): value is ProblemListQuickStatus {
    return value === 'all' || value === 'favorites' || value === 'solved' || value === 'unsolved';
  }

  private isSplitMode(value: unknown): value is WorkspaceSplitMode {
    return value === '40-60' || value === '50-50' || value === '60-40';
  }

  private isSort(value: unknown): value is ProblemListSort {
    return (
      value === 'newest' ||
      value === 'oldest' ||
      value === 'points-desc' ||
      value === 'points-asc' ||
      value === 'difficulty-asc' ||
      value === 'difficulty-desc' ||
      value === 'title-asc' ||
      value === 'title-desc'
    );
  }
}
