import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  effect,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

type StorageMode = 'local' | 'cloud';
type ShapeType = 'rectangle' | 'circle' | 'diamond' | 'text' | 'svg-image';
type StrokeStyle = 'solid' | 'dashed';
type ConnectorType = 'straight' | 'curved' | 'elbow';
type ToolMode = 'select' | 'pan' | 'connector';
type SortMode = 'updatedAt' | 'name';

interface DiagramElement {
  id: string;
  type: ShapeType;
  name: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  textColor: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  locked: boolean;
  layer: number;
  groupId: string | null;
  assetDataUrl?: string;
}

interface DiagramConnector {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  type: ConnectorType;
  stroke: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  arrow: boolean;
}

interface DiagramDocument {
  id: string;
  name: string;
  storage: StorageMode;
  createdAt: string;
  updatedAt: string;
  elements: DiagramElement[];
  connectors: DiagramConnector[];
  viewport: {
    panX: number;
    panY: number;
    zoom: number;
  };
}

interface DiagramSnapshot {
  elements: DiagramElement[];
  connectors: DiagramConnector[];
  viewport: {
    panX: number;
    panY: number;
    zoom: number;
  };
}

interface PersistedWorkspace {
  diagrams: DiagramDocument[];
  activeDiagramId: string | null;
}

interface CanvasBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface PanState {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startPanX: number;
  startPanY: number;
}

interface MoveState {
  pointerId: number;
  startWorldX: number;
  startWorldY: number;
  origins: Array<{ id: string; x: number; y: number }>;
}

interface ResizeState {
  pointerId: number;
  elementId: string;
  startWorldX: number;
  startWorldY: number;
  originWidth: number;
  originHeight: number;
}

interface RotateState {
  pointerId: number;
  elementId: string;
  centerX: number;
  centerY: number;
  originAngle: number;
  originRotation: number;
}

interface ShapePreset {
  id: string;
  label: string;
  type: ShapeType;
  description: string;
}

interface MinimapData {
  width: number;
  height: number;
  minX: number;
  minY: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  viewportX: number;
  viewportY: number;
  viewportWidth: number;
  viewportHeight: number;
}

const SHAPE_LIBRARY: ShapePreset[] = [
  { id: 'flow-process', label: 'Flow / Process', type: 'rectangle', description: 'Rectangle' },
  { id: 'flow-decision', label: 'Flow / Decision', type: 'diamond', description: 'Diamond' },
  { id: 'flow-start', label: 'Flow / Start-End', type: 'circle', description: 'Circle' },
  { id: 'basic-text', label: 'Basic / Text', type: 'text', description: 'Text box' },
];

@Component({
  selector: 'app-system-diagram-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './system-diagram-page.component.html',
  styleUrls: ['./system-diagram-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemDiagramPageComponent implements AfterViewInit {
  private static readonly STORAGE_KEY = 'coderank_system_diagram_workspace_v1';
  private readonly gridStep = 20;

  @ViewChild('canvasSurface') private canvasSurface?: ElementRef<SVGSVGElement>;
  @ViewChild('jsonInput') private jsonInput?: ElementRef<HTMLInputElement>;
  @ViewChild('svgInput') private svgInput?: ElementRef<HTMLInputElement>;

  readonly diagrams = signal<DiagramDocument[]>([]);
  readonly activeDiagramId = signal<string | null>(null);
  readonly searchKeyword = signal('');
  readonly sortMode = signal<SortMode>('updatedAt');
  readonly newDiagramName = signal('');
  readonly newDiagramStorage = signal<StorageMode>('local');
  readonly renameValue = signal('');

  readonly showGrid = signal(true);
  readonly snapToGrid = signal(true);
  readonly showMinimap = signal(true);
  readonly toolMode = signal<ToolMode>('select');
  readonly newConnectorType = signal<ConnectorType>('elbow');

  readonly panX = signal(0);
  readonly panY = signal(0);
  readonly zoom = signal(1);
  readonly canvasBounds = signal<CanvasBounds>({
    left: 0,
    top: 0,
    width: 1,
    height: 1,
  });

  readonly selectedElementIds = signal<string[]>([]);
  readonly selectedConnectorId = signal<string | null>(null);
  readonly connectorSourceId = signal<string | null>(null);
  readonly clipboardElements = signal<DiagramElement[]>([]);
  readonly clipboardConnectors = signal<DiagramConnector[]>([]);

  readonly undoStack = signal<DiagramSnapshot[]>([]);
  readonly redoStack = signal<DiagramSnapshot[]>([]);
  readonly statusMessage = signal('Sẵn sàng để thiết kế sơ đồ.');

  readonly shapeLibrary = SHAPE_LIBRARY;

  private readonly panState = signal<PanState | null>(null);
  private readonly moveState = signal<MoveState | null>(null);
  private readonly resizeState = signal<ResizeState | null>(null);
  private readonly rotateState = signal<RotateState | null>(null);

  readonly activeDiagram = computed(() => {
    const activeId = this.activeDiagramId();
    if (!activeId) return null;
    return this.diagrams().find(diagram => diagram.id === activeId) ?? null;
  });

  readonly hasActiveDiagram = computed(() => this.activeDiagram() !== null);

  readonly visibleDiagrams = computed(() => {
    const keyword = this.searchKeyword().trim().toLowerCase();
    const mode = this.sortMode();

    return this.diagrams()
      .filter(item => !keyword || item.name.toLowerCase().includes(keyword))
      .sort((a, b) => {
        if (mode === 'name') {
          return a.name.localeCompare(b.name, 'vi');
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  });

  readonly sortedElements = computed(() =>
    [...(this.activeDiagram()?.elements ?? [])].sort((a, b) => a.layer - b.layer)
  );

  readonly connectors = computed(() => this.activeDiagram()?.connectors ?? []);

  readonly selectedElements = computed(() => {
    const selectedIds = new Set(this.selectedElementIds());
    return this.sortedElements().filter(element => selectedIds.has(element.id));
  });

  readonly selectedElement = computed(() => this.selectedElements()[0] ?? null);

  readonly selectedConnector = computed(() => {
    const connectorId = this.selectedConnectorId();
    if (!connectorId) return null;
    return this.connectors().find(connector => connector.id === connectorId) ?? null;
  });

  readonly canUndo = computed(() => this.undoStack().length > 0);
  readonly canRedo = computed(() => this.redoStack().length > 0);

  readonly minimap = computed<MinimapData>(() => {
    const mapWidth = 220;
    const mapHeight = 138;
    const elements = this.sortedElements();
    const viewport = this.getViewportRectInWorld();

    let minX = viewport.x - 220;
    let minY = viewport.y - 220;
    let maxX = viewport.x + viewport.width + 220;
    let maxY = viewport.y + viewport.height + 220;

    for (const element of elements) {
      minX = Math.min(minX, element.x);
      minY = Math.min(minY, element.y);
      maxX = Math.max(maxX, element.x + element.width);
      maxY = Math.max(maxY, element.y + element.height);
    }

    const worldWidth = Math.max(1, maxX - minX);
    const worldHeight = Math.max(1, maxY - minY);
    const scale = Math.min((mapWidth - 12) / worldWidth, (mapHeight - 12) / worldHeight);
    const offsetX = (mapWidth - worldWidth * scale) / 2;
    const offsetY = (mapHeight - worldHeight * scale) / 2;

    return {
      width: mapWidth,
      height: mapHeight,
      minX,
      minY,
      offsetX,
      offsetY,
      scale,
      viewportX: offsetX + (viewport.x - minX) * scale,
      viewportY: offsetY + (viewport.y - minY) * scale,
      viewportWidth: viewport.width * scale,
      viewportHeight: viewport.height * scale,
    };
  });

  constructor() {
    this.bootstrapWorkspace();
    effect(() => {
      this.persistWorkspace({
        diagrams: this.diagrams(),
        activeDiagramId: this.activeDiagramId(),
      });
    });
  }

  ngAfterViewInit(): void {
    this.refreshCanvasBounds();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.refreshCanvasBounds();
  }

  @HostListener('window:keydown', ['$event'])
  onWindowKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const inTextField =
      target?.tagName === 'INPUT' ||
      target?.tagName === 'TEXTAREA' ||
      target?.isContentEditable;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      this.undo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      this.redo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      this.copySelection();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
      event.preventDefault();
      this.pasteSelection();
      return;
    }

    if (inTextField) return;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.deleteSelection();
    }
  }

  createDiagram(): void {
    const customName = this.newDiagramName().trim();
    const name = customName || `New Diagram ${this.diagrams().length + 1}`;
    const now = new Date().toISOString();
    const diagram: DiagramDocument = {
      id: this.createId('diagram'),
      name,
      storage: this.newDiagramStorage(),
      createdAt: now,
      updatedAt: now,
      elements: [],
      connectors: [],
      viewport: {
        panX: 0,
        panY: 0,
        zoom: 1,
      },
    };

    this.diagrams.update(items => [diagram, ...items]);
    this.openDiagram(diagram.id);
    this.newDiagramName.set('');
    this.statusMessage.set(`Đã tạo sơ đồ "${name}".`);
  }

  openDiagram(diagramId: string): void {
    const diagram = this.diagrams().find(item => item.id === diagramId);
    if (!diagram) return;

    this.activeDiagramId.set(diagramId);
    this.panX.set(diagram.viewport.panX);
    this.panY.set(diagram.viewport.panY);
    this.zoom.set(diagram.viewport.zoom);
    this.renameValue.set(diagram.name);
    this.selectedElementIds.set([]);
    this.selectedConnectorId.set(null);
    this.connectorSourceId.set(null);
    this.undoStack.set([]);
    this.redoStack.set([]);
    this.statusMessage.set(`Đã mở "${diagram.name}".`);
  }

  saveDiagram(): void {
    const active = this.activeDiagram();
    if (!active) return;

    this.mutateActiveDiagram(() => undefined, {
      recordHistory: false,
      touchUpdated: true,
    });
    if (active.storage === 'cloud') {
      this.statusMessage.set('Cloud mode: đã lưu cache local và sẵn sàng đồng bộ cloud.');
      return;
    }
    this.statusMessage.set('Đã lưu sơ đồ vào local.');
  }

  renameActiveDiagram(): void {
    const active = this.activeDiagram();
    if (!active) return;

    const nextName = this.renameValue().trim();
    if (!nextName) return;

    this.diagrams.update(items =>
      items.map(item =>
        item.id === active.id
          ? {
              ...item,
              name: nextName,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
    this.statusMessage.set(`Đã đổi tên sơ đồ thành "${nextName}".`);
  }

  duplicateDiagram(diagramId: string): void {
    const original = this.diagrams().find(item => item.id === diagramId);
    if (!original) return;

    const copy = this.cloneValue(original);
    const now = new Date().toISOString();
    copy.id = this.createId('diagram');
    copy.name = `${original.name} (Copy)`;
    copy.createdAt = now;
    copy.updatedAt = now;
    copy.elements = copy.elements.map(element => ({ ...element, id: this.createId('node') }));
    const mapping = new Map<string, string>();
    original.elements.forEach((element, index) => {
      mapping.set(element.id, copy.elements[index]?.id ?? element.id);
    });
    copy.connectors = copy.connectors.map(connector => ({
      ...connector,
      id: this.createId('edge'),
      fromId: mapping.get(connector.fromId) ?? connector.fromId,
      toId: mapping.get(connector.toId) ?? connector.toId,
    }));

    this.diagrams.update(items => [copy, ...items]);
    this.openDiagram(copy.id);
    this.statusMessage.set(`Đã nhân bản "${original.name}".`);
  }

  deleteDiagram(diagramId: string): void {
    const target = this.diagrams().find(item => item.id === diagramId);
    if (!target) return;

    this.diagrams.update(items => items.filter(item => item.id !== diagramId));
    if (this.activeDiagramId() === diagramId) {
      const fallback = this.diagrams()[0] ?? null;
      if (fallback) {
        this.openDiagram(fallback.id);
      } else {
        this.activeDiagramId.set(null);
        this.renameValue.set('');
        this.selectedElementIds.set([]);
        this.selectedConnectorId.set(null);
        this.undoStack.set([]);
        this.redoStack.set([]);
      }
    }
    this.statusMessage.set(`Đã xóa sơ đồ "${target.name}".`);
  }

  useTool(mode: ToolMode): void {
    this.toolMode.set(mode);
    this.connectorSourceId.set(null);
  }

  addShape(type: ShapeType): void {
    if (!this.hasActiveDiagram()) return;

    const center = this.getWorldCenter();
    const layer = this.getNextLayer();
    const element = this.createElement(type, center.x, center.y, layer);
    this.mutateActiveDiagram(
      diagram => {
        diagram.elements.push(element);
      },
      { recordHistory: true }
    );
    this.selectedElementIds.set([element.id]);
    this.selectedConnectorId.set(null);
    this.statusMessage.set(`Đã thêm "${element.name}".`);
  }

  addTextElement(): void {
    this.addShape('text');
  }

  onCanvasPointerDown(event: PointerEvent): void {
    this.refreshCanvasBounds();
    const target = event.target as Element | null;
    const clickedOnElement = target?.closest('[data-element-id]');
    const clickedOnConnector = target?.closest('[data-connector-id]');
    if (clickedOnElement || clickedOnConnector) return;

    this.selectedElementIds.set([]);
    this.selectedConnectorId.set(null);
    this.connectorSourceId.set(null);

    if (this.toolMode() === 'pan' || event.button === 1) {
      this.panState.set({
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPanX: this.panX(),
        startPanY: this.panY(),
      });
      (event.currentTarget as SVGElement | null)?.setPointerCapture(event.pointerId);
      event.preventDefault();
    }
  }

  onCanvasPointerMove(event: PointerEvent): void {
    const pan = this.panState();
    if (pan && pan.pointerId === event.pointerId) {
      this.updateViewport(
        pan.startPanX + (event.clientX - pan.startClientX),
        pan.startPanY + (event.clientY - pan.startClientY),
        this.zoom()
      );
      return;
    }

    const move = this.moveState();
    if (move && move.pointerId === event.pointerId) {
      const point = this.toWorldPoint(event);
      if (!point) return;
      const deltaX = point.x - move.startWorldX;
      const deltaY = point.y - move.startWorldY;

      this.mutateActiveDiagram(
        diagram => {
          const originMap = new Map(move.origins.map(item => [item.id, item]));
          diagram.elements = diagram.elements.map(element => {
            const origin = originMap.get(element.id);
            if (!origin || element.locked) return element;
            const nextX = this.snapCoordinate(origin.x + deltaX);
            const nextY = this.snapCoordinate(origin.y + deltaY);
            return {
              ...element,
              x: nextX,
              y: nextY,
            };
          });
        },
        { touchUpdated: false }
      );
      return;
    }

    const resize = this.resizeState();
    if (resize && resize.pointerId === event.pointerId) {
      const point = this.toWorldPoint(event);
      if (!point) return;
      const deltaX = point.x - resize.startWorldX;
      const deltaY = point.y - resize.startWorldY;
      const nextWidth = Math.max(56, this.snapCoordinate(resize.originWidth + deltaX));
      const nextHeight = Math.max(40, this.snapCoordinate(resize.originHeight + deltaY));

      this.mutateActiveDiagram(
        diagram => {
          diagram.elements = diagram.elements.map(element =>
            element.id === resize.elementId && !element.locked
              ? {
                  ...element,
                  width: nextWidth,
                  height: nextHeight,
                }
              : element
          );
        },
        { touchUpdated: false }
      );
      return;
    }

    const rotate = this.rotateState();
    if (rotate && rotate.pointerId === event.pointerId) {
      const point = this.toWorldPoint(event);
      if (!point) return;
      const currentAngle = Math.atan2(point.y - rotate.centerY, point.x - rotate.centerX);
      const delta = ((currentAngle - rotate.originAngle) * 180) / Math.PI;
      const nextRotation = rotate.originRotation + delta;

      this.mutateActiveDiagram(
        diagram => {
          diagram.elements = diagram.elements.map(element =>
            element.id === rotate.elementId && !element.locked
              ? {
                  ...element,
                  rotation: nextRotation,
                }
              : element
          );
        },
        { touchUpdated: false }
      );
    }
  }

  onCanvasPointerUp(event: PointerEvent): void {
    const pan = this.panState();
    if (pan && pan.pointerId === event.pointerId) {
      this.panState.set(null);
      this.persistViewport();
    }

    const move = this.moveState();
    if (move && move.pointerId === event.pointerId) {
      this.moveState.set(null);
      this.touchActiveDiagram();
    }

    const resize = this.resizeState();
    if (resize && resize.pointerId === event.pointerId) {
      this.resizeState.set(null);
      this.touchActiveDiagram();
    }

    const rotate = this.rotateState();
    if (rotate && rotate.pointerId === event.pointerId) {
      this.rotateState.set(null);
      this.touchActiveDiagram();
    }
  }

  onCanvasWheel(event: WheelEvent): void {
    event.preventDefault();
    this.refreshCanvasBounds();
    const rect = this.canvasBounds();
    const previousZoom = this.zoom();
    const nextZoom = this.clamp(previousZoom * (event.deltaY < 0 ? 1.08 : 0.92), 0.25, 3.2);

    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const worldX = (offsetX - this.panX()) / previousZoom;
    const worldY = (offsetY - this.panY()) / previousZoom;

    const nextPanX = offsetX - worldX * nextZoom;
    const nextPanY = offsetY - worldY * nextZoom;
    this.updateViewport(nextPanX, nextPanY, nextZoom);
  }

  zoomIn(): void {
    this.updateViewport(this.panX(), this.panY(), this.clamp(this.zoom() * 1.12, 0.25, 3.2));
  }

  zoomOut(): void {
    this.updateViewport(this.panX(), this.panY(), this.clamp(this.zoom() * 0.88, 0.25, 3.2));
  }

  resetView(): void {
    this.updateViewport(0, 0, 1);
  }

  onElementPointerDown(event: PointerEvent, elementId: string): void {
    const element = this.getElementById(elementId);
    if (!element) return;

    event.stopPropagation();
    this.selectedConnectorId.set(null);

    if (this.toolMode() === 'connector') {
      this.pickConnectorNode(elementId);
      return;
    }

    const multi = event.ctrlKey || event.metaKey;
    const nextSelection = this.resolveNextSelection(elementId, multi);
    this.selectedElementIds.set(nextSelection);
    this.connectorSourceId.set(null);

    if (element.locked) return;

    const point = this.toWorldPoint(event);
    if (!point) return;

    this.pushUndoSnapshot();
    const origins = this.sortedElements()
      .filter(item => nextSelection.includes(item.id))
      .map(item => ({ id: item.id, x: item.x, y: item.y }));

    this.moveState.set({
      pointerId: event.pointerId,
      startWorldX: point.x,
      startWorldY: point.y,
      origins,
    });
    (event.currentTarget as SVGElement | null)?.setPointerCapture(event.pointerId);
  }

  onResizeHandlePointerDown(event: PointerEvent, elementId: string): void {
    const element = this.getElementById(elementId);
    if (!element || element.locked) return;

    event.stopPropagation();
    const point = this.toWorldPoint(event);
    if (!point) return;

    this.pushUndoSnapshot();
    this.resizeState.set({
      pointerId: event.pointerId,
      elementId,
      startWorldX: point.x,
      startWorldY: point.y,
      originWidth: element.width,
      originHeight: element.height,
    });
    (event.currentTarget as SVGElement | null)?.setPointerCapture(event.pointerId);
  }

  onRotateHandlePointerDown(event: PointerEvent, elementId: string): void {
    const element = this.getElementById(elementId);
    if (!element || element.locked) return;

    event.stopPropagation();
    const center = this.getElementCenter(element);
    const point = this.toWorldPoint(event);
    if (!point) return;

    this.pushUndoSnapshot();
    this.rotateState.set({
      pointerId: event.pointerId,
      elementId,
      centerX: center.x,
      centerY: center.y,
      originAngle: Math.atan2(point.y - center.y, point.x - center.x),
      originRotation: element.rotation,
    });
    (event.currentTarget as SVGElement | null)?.setPointerCapture(event.pointerId);
  }

  onConnectorPointerDown(event: PointerEvent, connectorId: string): void {
    event.stopPropagation();
    this.selectedConnectorId.set(connectorId);
    this.selectedElementIds.set([]);
    this.connectorSourceId.set(null);
  }

  pickConnectorNode(elementId: string): void {
    const source = this.connectorSourceId();
    if (!source) {
      this.connectorSourceId.set(elementId);
      this.statusMessage.set('Đã chọn node nguồn, hãy chọn node đích.');
      return;
    }

    if (source === elementId) return;
    this.createConnector(source, elementId, this.newConnectorType(), '');
    this.connectorSourceId.set(null);
    this.statusMessage.set('Đã tạo connector.');
  }

  createConnector(
    fromId: string,
    toId: string,
    type: ConnectorType,
    label: string
  ): void {
    if (!this.hasActiveDiagram()) return;

    const duplicate = this.connectors().some(
      connector => connector.fromId === fromId && connector.toId === toId && connector.type === type
    );
    if (duplicate) return;

    const connector: DiagramConnector = {
      id: this.createId('connector'),
      fromId,
      toId,
      label: label.trim(),
      type,
      stroke: '#58a6ff',
      strokeWidth: 2,
      strokeStyle: 'solid',
      arrow: true,
    };

    this.mutateActiveDiagram(
      diagram => {
        diagram.connectors.push(connector);
      },
      { recordHistory: true }
    );
    this.selectedConnectorId.set(connector.id);
    this.selectedElementIds.set([]);
  }

  updateConnectorLabel(value: string): void {
    const connector = this.selectedConnector();
    if (!connector) return;
    this.mutateActiveDiagram(diagram => {
      diagram.connectors = diagram.connectors.map(item =>
        item.id === connector.id
          ? {
              ...item,
              label: value,
            }
          : item
      );
    });
  }

  updateConnectorType(value: ConnectorType): void {
    const connector = this.selectedConnector();
    if (!connector) return;
    this.mutateActiveDiagram(diagram => {
      diagram.connectors = diagram.connectors.map(item =>
        item.id === connector.id
          ? {
              ...item,
              type: value,
            }
          : item
      );
    });
  }

  updateConnectorStroke(value: string): void {
    const connector = this.selectedConnector();
    if (!connector) return;
    this.mutateActiveDiagram(diagram => {
      diagram.connectors = diagram.connectors.map(item =>
        item.id === connector.id
          ? {
              ...item,
              stroke: value,
            }
          : item
      );
    });
  }

  toggleConnectorArrow(value: boolean): void {
    const connector = this.selectedConnector();
    if (!connector) return;
    this.mutateActiveDiagram(diagram => {
      diagram.connectors = diagram.connectors.map(item =>
        item.id === connector.id
          ? {
              ...item,
              arrow: value,
            }
          : item
      );
    });
  }

  alignSelected(mode: 'left' | 'right' | 'h-center' | 'top' | 'bottom' | 'v-center'): void {
    const elements = this.selectedElements().filter(item => !item.locked);
    if (elements.length < 2) return;

    const minX = Math.min(...elements.map(item => item.x));
    const maxX = Math.max(...elements.map(item => item.x + item.width));
    const minY = Math.min(...elements.map(item => item.y));
    const maxY = Math.max(...elements.map(item => item.y + item.height));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const selected = new Set(elements.map(item => item.id));

    this.mutateActiveDiagram(
      diagram => {
        diagram.elements = diagram.elements.map(item => {
          if (!selected.has(item.id)) return item;
          if (mode === 'left') return { ...item, x: minX };
          if (mode === 'right') return { ...item, x: maxX - item.width };
          if (mode === 'h-center') return { ...item, x: centerX - item.width / 2 };
          if (mode === 'top') return { ...item, y: minY };
          if (mode === 'bottom') return { ...item, y: maxY - item.height };
          return { ...item, y: centerY - item.height / 2 };
        });
      },
      { recordHistory: true }
    );
  }

  distributeSelected(mode: 'horizontal' | 'vertical'): void {
    const items = this.selectedElements().filter(item => !item.locked);
    if (items.length < 3) return;

    const sorted =
      mode === 'horizontal'
        ? [...items].sort((a, b) => a.x - b.x)
        : [...items].sort((a, b) => a.y - b.y);

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const start = mode === 'horizontal' ? first.x : first.y;
    const end = mode === 'horizontal' ? last.x : last.y;
    const gap = (end - start) / (sorted.length - 1);
    const map = new Map<string, number>();
    sorted.forEach((item, index) => {
      map.set(item.id, start + gap * index);
    });

    this.mutateActiveDiagram(
      diagram => {
        diagram.elements = diagram.elements.map(item => {
          const nextValue = map.get(item.id);
          if (nextValue === undefined) return item;
          return mode === 'horizontal'
            ? { ...item, x: nextValue }
            : { ...item, y: nextValue };
        });
      },
      { recordHistory: true }
    );
  }

  groupSelected(): void {
    const selected = this.selectedElements().filter(item => !item.locked);
    if (selected.length < 2) return;
    const groupId = this.createId('group');

    this.mutateActiveDiagram(
      diagram => {
        const selectedIds = new Set(selected.map(item => item.id));
        diagram.elements = diagram.elements.map(item =>
          selectedIds.has(item.id)
            ? {
                ...item,
                groupId,
              }
            : item
        );
      },
      { recordHistory: true }
    );
  }

  ungroupSelected(): void {
    const selectedIds = new Set(this.selectedElementIds());
    if (!selectedIds.size) return;

    this.mutateActiveDiagram(
      diagram => {
        diagram.elements = diagram.elements.map(item =>
          selectedIds.has(item.id)
            ? {
                ...item,
                groupId: null,
              }
            : item
        );
      },
      { recordHistory: true }
    );
  }

  bringToFront(): void {
    const selected = new Set(this.selectedElementIds());
    if (!selected.size) return;
    const baseLayer = Math.max(0, ...this.sortedElements().map(item => item.layer)) + 10;
    let offset = 0;

    this.mutateActiveDiagram(
      diagram => {
        diagram.elements = diagram.elements.map(item =>
          selected.has(item.id)
            ? {
                ...item,
                layer: baseLayer + offset++,
              }
            : item
        );
      },
      { recordHistory: true }
    );
  }

  sendToBack(): void {
    const selected = new Set(this.selectedElementIds());
    if (!selected.size) return;
    const minLayer = Math.min(0, ...this.sortedElements().map(item => item.layer)) - 10;
    let offset = 0;

    this.mutateActiveDiagram(
      diagram => {
        diagram.elements = diagram.elements.map(item =>
          selected.has(item.id)
            ? {
                ...item,
                layer: minLayer - offset++,
              }
            : item
        );
      },
      { recordHistory: true }
    );
  }

  lockSelected(): void {
    this.setLockForSelected(true);
  }

  unlockSelected(): void {
    this.setLockForSelected(false);
  }

  setElementFill(value: string): void {
    this.updateSelectedElementStyle({ fill: value });
  }

  setElementStroke(value: string): void {
    this.updateSelectedElementStyle({ stroke: value });
  }

  setElementStrokeWidth(value: number): void {
    const next = Number(value);
    if (Number.isNaN(next)) return;
    this.updateSelectedElementStyle({ strokeWidth: this.clamp(next, 1, 14) });
  }

  setElementStrokeStyle(value: StrokeStyle): void {
    this.updateSelectedElementStyle({ strokeStyle: value });
  }

  setElementFontSize(value: number): void {
    const next = Number(value);
    if (Number.isNaN(next)) return;
    this.updateSelectedElementStyle({ fontSize: this.clamp(next, 10, 44) });
  }

  setElementTextColor(value: string): void {
    this.updateSelectedElementStyle({ textColor: value });
  }

  setElementBold(value: boolean): void {
    this.updateSelectedElementStyle({ bold: value });
  }

  setElementItalic(value: boolean): void {
    this.updateSelectedElementStyle({ italic: value });
  }

  setElementText(value: string): void {
    this.updateSelectedElementStyle({ text: value });
  }

  deleteSelection(): void {
    const selectedIds = new Set(this.selectedElementIds());
    const selectedConnector = this.selectedConnectorId();
    if (!selectedIds.size && !selectedConnector) return;

    this.mutateActiveDiagram(
      diagram => {
        if (selectedIds.size) {
          diagram.elements = diagram.elements.filter(item => !selectedIds.has(item.id));
          diagram.connectors = diagram.connectors.filter(
            connector =>
              !selectedIds.has(connector.fromId) && !selectedIds.has(connector.toId)
          );
        }
        if (selectedConnector) {
          diagram.connectors = diagram.connectors.filter(
            connector => connector.id !== selectedConnector
          );
        }
      },
      { recordHistory: true }
    );

    this.selectedElementIds.set([]);
    this.selectedConnectorId.set(null);
  }

  copySelection(): void {
    const selected = this.selectedElements();
    if (!selected.length) return;

    const selectedIds = new Set(selected.map(item => item.id));
    const connectors = this.connectors().filter(
      connector => selectedIds.has(connector.fromId) && selectedIds.has(connector.toId)
    );
    this.clipboardElements.set(this.cloneValue(selected));
    this.clipboardConnectors.set(this.cloneValue(connectors));
    this.statusMessage.set('Đã copy phần tử đã chọn.');
  }

  pasteSelection(): void {
    const elements = this.clipboardElements();
    if (!elements.length || !this.hasActiveDiagram()) return;

    const connectors = this.clipboardConnectors();
    const mapping = new Map<string, string>();
    const copied = elements.map(item => {
      const id = this.createId('node');
      mapping.set(item.id, id);
      return {
        ...this.cloneValue(item),
        id,
        x: item.x + 26,
        y: item.y + 26,
        layer: this.getNextLayer(),
      };
    });
    const copiedConnectors = connectors.map(connector => ({
      ...this.cloneValue(connector),
      id: this.createId('connector'),
      fromId: mapping.get(connector.fromId) ?? connector.fromId,
      toId: mapping.get(connector.toId) ?? connector.toId,
    }));

    this.mutateActiveDiagram(
      diagram => {
        diagram.elements.push(...copied);
        diagram.connectors.push(...copiedConnectors);
      },
      { recordHistory: true }
    );

    this.selectedElementIds.set(copied.map(item => item.id));
    this.selectedConnectorId.set(null);
  }

  undo(): void {
    const active = this.activeDiagram();
    const undo = this.undoStack();
    if (!active || !undo.length) return;

    const current = this.captureSnapshot(active);
    const previous = undo[undo.length - 1];

    this.undoStack.update(items => items.slice(0, -1));
    this.redoStack.update(items => [...items, current]);
    this.applySnapshot(previous);
    this.statusMessage.set('Undo thành công.');
  }

  redo(): void {
    const active = this.activeDiagram();
    const redo = this.redoStack();
    if (!active || !redo.length) return;

    const current = this.captureSnapshot(active);
    const next = redo[redo.length - 1];

    this.redoStack.update(items => items.slice(0, -1));
    this.undoStack.update(items => [...items, current]);
    this.applySnapshot(next);
    this.statusMessage.set('Redo thành công.');
  }

  exportJson(): void {
    const active = this.activeDiagram();
    if (!active) return;
    const blob = new Blob([JSON.stringify(active, null, 2)], {
      type: 'application/json',
    });
    this.downloadBlob(blob, `${this.normalizeFileName(active.name)}.json`);
  }

  triggerJsonImport(): void {
    this.jsonInput?.nativeElement.click();
  }

  onJsonImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    file
      .text()
      .then(raw => {
        const parsed = JSON.parse(raw);
        const diagram = this.toDiagramDocument(parsed, file.name.replace(/\.[^.]+$/, ''));
        if (!diagram) {
          this.statusMessage.set('File JSON không hợp lệ.');
          return;
        }
        this.diagrams.update(items => [diagram, ...items]);
        this.openDiagram(diagram.id);
        this.statusMessage.set(`Đã import JSON "${diagram.name}".`);
      })
      .catch(() => {
        this.statusMessage.set('Không thể đọc file JSON.');
      })
      .finally(() => {
        input.value = '';
      });
  }

  exportSvg(): void {
    const svg = this.canvasSurface?.nativeElement;
    const active = this.activeDiagram();
    if (!svg || !active) return;

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const data = `<?xml version="1.0" encoding="UTF-8"?>\n${clone.outerHTML}`;
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    this.downloadBlob(blob, `${this.normalizeFileName(active.name)}.svg`);
  }

  exportPng(): void {
    const svg = this.canvasSurface?.nativeElement;
    const active = this.activeDiagram();
    if (!svg || !active) return;

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const data = `<?xml version="1.0" encoding="UTF-8"?>\n${clone.outerHTML}`;
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, svg.clientWidth);
      canvas.height = Math.max(1, svg.clientHeight);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (blob) {
          this.downloadBlob(blob, `${this.normalizeFileName(active.name)}.png`);
        }
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }

  exportPdf(): void {
    const svg = this.canvasSurface?.nativeElement;
    const active = this.activeDiagram();
    if (!svg || !active) return;

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const data = `<?xml version="1.0" encoding="UTF-8"?>\n${clone.outerHTML}`;
    const encoded = encodeURIComponent(data);
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=1200,height=900');
    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>${active.name}</title>
          <style>
            html, body { margin: 0; padding: 0; background: #fff; }
            img { width: 100%; height: auto; display: block; }
          </style>
        </head>
        <body>
          <img src="data:image/svg+xml;charset=utf-8,${encoded}" alt="diagram" />
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    popup.document.close();
  }

  triggerSvgImport(): void {
    this.svgInput?.nativeElement.click();
  }

  onSvgImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.hasActiveDiagram()) return;

    file
      .text()
      .then(raw => {
        const dataUrl = `data:image/svg+xml;base64,${btoa(
          unescape(encodeURIComponent(raw))
        )}`;
        const center = this.getWorldCenter();
        const element: DiagramElement = {
          id: this.createId('node'),
          type: 'svg-image',
          name: file.name.replace(/\.[^.]+$/, ''),
          text: file.name.replace(/\.[^.]+$/, ''),
          x: center.x - 120,
          y: center.y - 80,
          width: 240,
          height: 160,
          rotation: 0,
          fill: '#0d1117',
          stroke: '#58a6ff',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          textColor: '#f0f6fc',
          fontSize: 14,
          bold: false,
          italic: false,
          locked: false,
          layer: this.getNextLayer(),
          groupId: null,
          assetDataUrl: dataUrl,
        };
        this.mutateActiveDiagram(
          diagram => {
            diagram.elements.push(element);
          },
          { recordHistory: true }
        );
        this.selectedElementIds.set([element.id]);
      })
      .catch(() => {
        this.statusMessage.set('Không thể import SVG.');
      })
      .finally(() => {
        input.value = '';
      });
  }

  onMinimapPointerDown(event: PointerEvent): void {
    if (!this.hasActiveDiagram()) return;
    const target = event.currentTarget as SVGSVGElement | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const map = this.minimap();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const worldX = map.minX + (pointerX - map.offsetX) / map.scale;
    const worldY = map.minY + (pointerY - map.offsetY) / map.scale;

    const bounds = this.canvasBounds();
    const nextPanX = bounds.width / 2 - worldX * this.zoom();
    const nextPanY = bounds.height / 2 - worldY * this.zoom();
    this.updateViewport(nextPanX, nextPanY, this.zoom());
  }

  connectorPath(connector: DiagramConnector): string {
    const from = this.getElementById(connector.fromId);
    const to = this.getElementById(connector.toId);
    if (!from || !to) return '';

    const fromCenter = this.getElementCenter(from);
    const toCenter = this.getElementCenter(to);
    const start = this.resolveAnchorPoint(from, toCenter);
    const end = this.resolveAnchorPoint(to, fromCenter);

    if (connector.type === 'straight') {
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }
    if (connector.type === 'curved') {
      const controlX = (start.x + end.x) / 2;
      const controlY = Math.min(start.y, end.y) - 54;
      return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`;
    }

    const elbowX = (start.x + end.x) / 2;
    return `M ${start.x} ${start.y} L ${elbowX} ${start.y} L ${elbowX} ${end.y} L ${end.x} ${end.y}`;
  }

  connectorLabelX(connector: DiagramConnector): number {
    const from = this.getElementById(connector.fromId);
    const to = this.getElementById(connector.toId);
    if (!from || !to) return 0;
    const fromCenter = this.getElementCenter(from);
    const toCenter = this.getElementCenter(to);
    return (fromCenter.x + toCenter.x) / 2;
  }

  connectorLabelY(connector: DiagramConnector): number {
    const from = this.getElementById(connector.fromId);
    const to = this.getElementById(connector.toId);
    if (!from || !to) return 0;
    const fromCenter = this.getElementCenter(from);
    const toCenter = this.getElementCenter(to);
    return (fromCenter.y + toCenter.y) / 2 - 8;
  }

  isElementSelected(elementId: string): boolean {
    return this.selectedElementIds().includes(elementId);
  }

  elementTransform(element: DiagramElement): string {
    const centerX = element.width / 2;
    const centerY = element.height / 2;
    return `translate(${element.x} ${element.y}) rotate(${element.rotation} ${centerX} ${centerY})`;
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

  minimapSize(value: number): number {
    return Math.max(2, value * this.minimap().scale);
  }

  toggleGrid(): void {
    this.showGrid.update(value => !value);
  }

  toggleSnap(): void {
    this.snapToGrid.update(value => !value);
  }

  toggleMinimap(): void {
    this.showMinimap.update(value => !value);
  }

  private bootstrapWorkspace(): void {
    const persisted = this.loadWorkspace();
    if (persisted) {
      this.diagrams.set(persisted.diagrams);
      if (
        persisted.activeDiagramId &&
        persisted.diagrams.some(item => item.id === persisted.activeDiagramId)
      ) {
        this.openDiagram(persisted.activeDiagramId);
      } else if (persisted.diagrams[0]) {
        this.openDiagram(persisted.diagrams[0].id);
      }
      return;
    }

    this.statusMessage.set('Chưa có sơ đồ. Hãy tạo sơ đồ mới để bắt đầu.');
  }

  private persistWorkspace(payload: PersistedWorkspace): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    localStorage.setItem(SystemDiagramPageComponent.STORAGE_KEY, JSON.stringify(payload));
  }

  private loadWorkspace(): PersistedWorkspace | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(SystemDiagramPageComponent.STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as PersistedWorkspace;
      if (!Array.isArray(parsed.diagrams)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  private mutateActiveDiagram(
    mutator: (diagram: DiagramDocument) => void,
    options: { recordHistory?: boolean; touchUpdated?: boolean } = {}
  ): void {
    const active = this.activeDiagram();
    if (!active) return;

    if (options.recordHistory) {
      this.pushUndoSnapshot();
    }

    const next = this.cloneValue(active);
    mutator(next);
    if (options.touchUpdated !== false) {
      next.updatedAt = new Date().toISOString();
    }
    this.diagrams.update(items => items.map(item => (item.id === next.id ? next : item)));
  }

  private touchActiveDiagram(): void {
    this.mutateActiveDiagram(() => undefined);
  }

  private updateViewport(nextPanX: number, nextPanY: number, nextZoom: number): void {
    this.panX.set(nextPanX);
    this.panY.set(nextPanY);
    this.zoom.set(nextZoom);
    this.persistViewport();
  }

  private persistViewport(): void {
    this.mutateActiveDiagram(
      diagram => {
        diagram.viewport = {
          panX: this.panX(),
          panY: this.panY(),
          zoom: this.zoom(),
        };
      },
      { touchUpdated: false }
    );
  }

  private pushUndoSnapshot(): void {
    const active = this.activeDiagram();
    if (!active) return;
    const snapshot = this.captureSnapshot(active);
    this.undoStack.update(items => [...items.slice(-59), snapshot]);
    this.redoStack.set([]);
  }

  private captureSnapshot(diagram: DiagramDocument): DiagramSnapshot {
    return {
      elements: this.cloneValue(diagram.elements),
      connectors: this.cloneValue(diagram.connectors),
      viewport: this.cloneValue(diagram.viewport),
    };
  }

  private applySnapshot(snapshot: DiagramSnapshot): void {
    this.mutateActiveDiagram(
      diagram => {
        diagram.elements = this.cloneValue(snapshot.elements);
        diagram.connectors = this.cloneValue(snapshot.connectors);
        diagram.viewport = this.cloneValue(snapshot.viewport);
      },
      { touchUpdated: false }
    );
    this.panX.set(snapshot.viewport.panX);
    this.panY.set(snapshot.viewport.panY);
    this.zoom.set(snapshot.viewport.zoom);
    this.selectedElementIds.set([]);
    this.selectedConnectorId.set(null);
  }

  private createElement(type: ShapeType, centerX: number, centerY: number, layer: number): DiagramElement {
    const id = this.createId('node');
    const base: Omit<DiagramElement, 'id' | 'type' | 'name' | 'text'> = {
      x: this.snapCoordinate(centerX - 90),
      y: this.snapCoordinate(centerY - 46),
      width: 180,
      height: 92,
      rotation: 0,
      fill: '#1f2937',
      stroke: '#58a6ff',
      strokeWidth: 2,
      strokeStyle: 'solid',
      textColor: '#f0f6fc',
      fontSize: 14,
      bold: false,
      italic: false,
      locked: false,
      layer,
      groupId: null,
    };

    if (type === 'circle') {
      return {
        id,
        type,
        name: 'Circle',
        text: 'Circle',
        ...base,
        width: 140,
        height: 140,
      };
    }
    if (type === 'diamond') {
      return {
        id,
        type,
        name: 'Decision',
        text: 'Decision',
        ...base,
        width: 172,
        height: 112,
      };
    }
    if (type === 'text') {
      return {
        id,
        type,
        name: 'Text',
        text: 'Double click to edit',
        ...base,
        fill: '#111827',
        stroke: '#8b949e',
        width: 220,
        height: 88,
      };
    }
    if (type === 'svg-image') {
      return {
        id,
        type,
        name: 'SVG',
        text: 'Imported SVG',
        ...base,
        width: 220,
        height: 160,
      };
    }
    return {
      id,
      type,
      name: 'Process',
      text: 'Process',
      ...base,
    };
  }

  private setLockForSelected(locked: boolean): void {
    const selectedIds = new Set(this.selectedElementIds());
    if (!selectedIds.size) return;
    this.mutateActiveDiagram(
      diagram => {
        diagram.elements = diagram.elements.map(element =>
          selectedIds.has(element.id)
            ? {
                ...element,
                locked,
              }
            : element
        );
      },
      { recordHistory: true }
    );
  }

  private updateSelectedElementStyle(
    patch: Partial<
      Pick<
        DiagramElement,
        | 'fill'
        | 'stroke'
        | 'strokeWidth'
        | 'strokeStyle'
        | 'textColor'
        | 'fontSize'
        | 'bold'
        | 'italic'
        | 'text'
      >
    >
  ): void {
    const selectedIds = new Set(this.selectedElementIds());
    if (!selectedIds.size) return;
    this.mutateActiveDiagram(diagram => {
      diagram.elements = diagram.elements.map(element =>
        selectedIds.has(element.id)
          ? {
              ...element,
              ...patch,
            }
          : element
      );
    });
  }

  private getNextLayer(): number {
    const maxLayer = Math.max(0, ...this.sortedElements().map(item => item.layer));
    return maxLayer + 10;
  }

  private getElementById(elementId: string): DiagramElement | null {
    return this.sortedElements().find(element => element.id === elementId) ?? null;
  }

  private getElementCenter(element: DiagramElement): { x: number; y: number } {
    return {
      x: element.x + element.width / 2,
      y: element.y + element.height / 2,
    };
  }

  private resolveAnchorPoint(
    source: DiagramElement,
    targetCenter: { x: number; y: number }
  ): { x: number; y: number } {
    const center = this.getElementCenter(source);
    const dx = targetCenter.x - center.x;
    const dy = targetCenter.y - center.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return {
        x: dx >= 0 ? source.x + source.width : source.x,
        y: center.y,
      };
    }

    return {
      x: center.x,
      y: dy >= 0 ? source.y + source.height : source.y,
    };
  }

  private resolveNextSelection(elementId: string, multi: boolean): string[] {
    const current = this.selectedElementIds();
    if (!multi) return [elementId];
    if (current.includes(elementId)) {
      return current.filter(id => id !== elementId);
    }
    return [...current, elementId];
  }

  private toWorldPoint(event: PointerEvent): { x: number; y: number } | null {
    const bounds = this.canvasBounds();
    if (!bounds.width || !bounds.height) return null;
    return {
      x: (event.clientX - bounds.left - this.panX()) / this.zoom(),
      y: (event.clientY - bounds.top - this.panY()) / this.zoom(),
    };
  }

  private getWorldCenter(): { x: number; y: number } {
    const bounds = this.canvasBounds();
    return {
      x: (bounds.width / 2 - this.panX()) / this.zoom(),
      y: (bounds.height / 2 - this.panY()) / this.zoom(),
    };
  }

  private refreshCanvasBounds(): void {
    const svg = this.canvasSurface?.nativeElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    this.canvasBounds.set({
      left: rect.left,
      top: rect.top,
      width: Math.max(1, rect.width),
      height: Math.max(1, rect.height),
    });
  }

  private getViewportRectInWorld(): { x: number; y: number; width: number; height: number } {
    const bounds = this.canvasBounds();
    return {
      x: -this.panX() / this.zoom(),
      y: -this.panY() / this.zoom(),
      width: bounds.width / this.zoom(),
      height: bounds.height / this.zoom(),
    };
  }

  private snapCoordinate(value: number): number {
    if (!this.snapToGrid()) return value;
    return Math.round(value / this.gridStep) * this.gridStep;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private toDiagramDocument(raw: unknown, fallbackName: string): DiagramDocument | null {
    if (!raw || typeof raw !== 'object') return null;
    const now = new Date().toISOString();
    const source = raw as Partial<DiagramDocument> & { elements?: unknown; connectors?: unknown };

    if (!Array.isArray(source.elements) || !Array.isArray(source.connectors)) return null;

    return {
      id: this.createId('diagram'),
      name: typeof source.name === 'string' && source.name.trim() ? source.name : fallbackName,
      storage: source.storage === 'cloud' ? 'cloud' : 'local',
      createdAt: now,
      updatedAt: now,
      elements: source.elements as DiagramElement[],
      connectors: source.connectors as DiagramConnector[],
      viewport: {
        panX: source.viewport?.panX ?? 0,
        panY: source.viewport?.panY ?? 0,
        zoom: source.viewport?.zoom ?? 1,
      },
    };
  }

  private normalizeFileName(name: string): string {
    const normalized = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');
    return normalized || 'diagram';
  }

  private cloneValue<T>(value: T): T {
    if (typeof structuredClone === 'function') {
      return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value)) as T;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private createId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  }
}
