import { DatabaseService } from './database.service';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '../types';

export class ChatHistoryService {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  async saveMessage(userId: string, userMessage: string, aiResponse: string, conversationId?: string): Promise<string> {
    return await this.db.transaction(async (client) => {
      if (!conversationId) {
        conversationId = uuidv4();
        await client.query(
          `INSERT INTO conversations (id, user_id, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())`,
          [conversationId, userId]
        );
      }

      await client.query(
        `INSERT INTO chat_messages (id, conversation_id, role, content, created_at) VALUES ($1, $2, $3, $4, NOW())`,
        [uuidv4(), conversationId, 'user', userMessage]
      );

      await client.query(
        `INSERT INTO chat_messages (id, conversation_id, role, content, created_at) VALUES ($1, $2, $3, $4, NOW())`,
        [uuidv4(), conversationId, 'assistant', aiResponse]
      );

      await client.query(
        `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
        [conversationId]
      );

      return conversationId;
    });
  }

  async getConversationHistory(conversationId: string, limit: number = 20): Promise<ChatMessage[]> {
    const result = await this.db.query(
      `SELECT role, content, created_at FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT $2`,
      [conversationId, limit]
    );

    return result.map(row => ({
      role: row.role as 'user' | 'assistant' | 'system',
      content: row.content,
      timestamp: row.created_at
    }));
  }

  async getUserConversations(userId: string, limit: number = 10) {
    const result = await this.db.query(
      `SELECT c.id, c.created_at, c.updated_at,
              COALESCE(JSON_AGG(JSON_BUILD_OBJECT('role', cm.role, 'content', cm.content, 'timestamp', cm.created_at) ORDER BY cm.created_at) FILTER (WHERE cm.id IS NOT NULL), '[]'::json) as messages
       FROM conversations c
       LEFT JOIN chat_messages cm ON c.id = cm.conversation_id
       WHERE c.user_id = $1
       GROUP BY c.id ORDER BY c.updated_at DESC LIMIT $2`,
      [userId, limit]
    );

    return result.map(row => ({
      id: row.id,
      userId,
      messages: row.messages || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM conversations WHERE id = $1 AND user_id = $2`,
      [conversationId, userId]
    );
    return result.length > 0;
  }

  async getRecentContext(userId: string, limit: number = 6): Promise<ChatMessage[]> {
    const result = await this.db.query(
      `SELECT cm.role, cm.content, cm.created_at
       FROM chat_messages cm
       JOIN conversations c ON cm.conversation_id = c.id
       WHERE c.user_id = $1
       ORDER BY cm.created_at DESC LIMIT $2`,
      [userId, limit]
    );

    return result.reverse().map(row => ({
      role: row.role as 'user' | 'assistant' | 'system',
      content: row.content,
      timestamp: row.created_at
    }));
  }
}