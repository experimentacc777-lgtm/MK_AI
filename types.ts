
export type MessageRole = 'user' | 'model';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text?: string;
  imageUrl?: string;
  sources?: GroundingSource[];
  isImage?: boolean;
  isEditing?: boolean;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  photoUrl?: string;
  isGuest: boolean;
}

export enum Intent {
  CHAT = 'CHAT',
  IMAGE_GEN = 'IMAGE_GEN',
  IMAGE_ANALYZE = 'IMAGE_ANALYZE',
  IMAGE_EDIT = 'IMAGE_EDIT',
  SEARCH = 'SEARCH'
}
