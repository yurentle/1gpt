export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  providerId: string;
  modelId: string;
  createdAt: number;
  updatedAt: number;
}
