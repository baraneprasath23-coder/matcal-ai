export interface VisualizationData {
  type: 'geometry' | 'argand' | 'function';
  data: any;
}

export interface Calculation {
  id: string;
  query: string;
  result: string;
  explanation?: string;
  visualization?: VisualizationData;
  timestamp: number;
  type: 'basic' | 'ai';
}

export interface AIResponse {
  answer: string;
  explanation: string;
  visualization?: VisualizationData;
}
