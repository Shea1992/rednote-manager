export type DeviceStatus = 'online' | 'offline';

export interface Device {
  id: string;
  name: string;
  accountName: string;
  accountAvatar: string;
  status: DeviceStatus;
  lastHeartbeat: number;
  fansCount: number;
  notesCount: number;
  activeMode: 'preset' | 'ai' | 'manual';
}

export type CommentStatus = 'pending' | 'ai_generating' | 'replying' | 'replied' | 'failed';

export interface CommentMessage {
  id: string;
  terminalId: string;
  terminalName: string;
  accountName: string;
  postTitle: string;
  postCover: string;
  commenterName: string;
  commenterAvatar: string;
  content: string;
  time: number;
  replyText?: string;
  replyTime?: number;
  status: CommentStatus;
  errorMsg?: string;
}

export interface KeywordRule {
  id: string;
  keyword: string;
  reply: string;
}

export interface Settings {
  activeHoursStart: string; // e.g. "08:00"
  activeHoursEnd: string;   // e.g. "22:00"
  keywordRules: KeywordRule[];
  knowledgeBase: string;
  aiPrompt: string;
  isMonitoringActive: boolean;
}

export interface SystemLog {
  id: string;
  timestamp: number;
  type: 'report' | 'reply' | 'heartbeat' | 'ai' | 'info' | 'error';
  title: string;
  description: string;
  payload?: string;
}

export interface Command {
  id: string;
  terminalId: string;
  commentId: string;
  type: 'reply';
  replyText: string;
  timestamp: number;
}
