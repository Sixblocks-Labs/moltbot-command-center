export type ChatRole = 'user' | 'assistant' | 'system' | 'tool';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  ts: number;
  meta?: Record<string, unknown>;
};

export type ToolEvent = {
  id: string;
  tool: string;
  status: 'running' | 'done' | 'error';
  output?: string;
  ts: number;
};

export type ChatEvent = {
  runId: string;
  sessionKey: string;
  seq: number;
  state: 'delta' | 'final' | 'aborted' | 'error';
  message?: {
    role?: string;
    content?: Array<{ type: string; text?: string }>;
    timestamp?: number;
  };
  errorMessage?: string;
  usage?: unknown;
  stopReason?: string;
};
