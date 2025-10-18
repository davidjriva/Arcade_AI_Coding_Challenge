export interface FlowData {
  uploadId?: string;
  name?: string;
  title?: string;
  description?: string;
  steps: FlowStep[];
  capturedEvents?: CapturedEvent[];
  created?: {
    _seconds: number;
    _nanoseconds: number;
  };
  [key: string]: unknown; // Allow additional fields
}

export interface FlowStep {
  id?: string;
  type: string; // IMAGE, CHAPTER, VIDEO, etc.
  title?: string;
  subtitle?: string;
  url?: string;
  hotspots?: Hotspot[];
  pageContext?: PageContext;
  clickContext?: ClickContext;
  data?: unknown;
  metadata?: {
    click?: unknown;
    timestamp?: number;
  };
  [key: string]: unknown; // Allow additional fields
}

export interface CapturedEvent {
  type: string; // click, dragging, etc.
  clickId?: string;
  frameX?: number;
  frameY?: number;
  timeMs?: number;
  tabId?: number;
  frameId?: number;
  [key: string]: unknown;
}

export interface Hotspot {
  id: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: unknown;
}

export interface PageContext {
  url?: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  language?: string;
}

export interface ClickContext {
  cssSelector?: string;
  text?: string;
  elementType?: string;
  sections?: string[];
  [key: string]: unknown;
}

export interface AnalysisResult {
  interactions: string[];
  summary: string;
  imagePath: string;
}
