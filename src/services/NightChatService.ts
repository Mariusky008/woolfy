import { Socket, io } from 'socket.io-client';
import CryptoJS from 'crypto-js';

interface NightChatMessage {
  id: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  content: string;
  timestamp: Date;
  encryptedContent?: string;
}

class NightChatService {
  private socket: Socket | null = null;
  private encryptionKey: string;
  private gameId: string | null = null;

  constructor() {
    this.encryptionKey = import.meta.env.VITE_CHAT_ENCRYPTION_KEY || 'default-key';
  }

  connect(gameId: string) {
    this.gameId = gameId;
    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      query: { gameId },
    });

    this.socket.on('connect', () => {
      console.log('Connected to night chat service');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from night chat service');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Envoyer un message chiffré
  async sendMessage(message: NightChatMessage): Promise<void> {
    if (!this.socket || !this.gameId) {
      throw new Error('Not connected to chat service');
    }

    const encryptedContent = CryptoJS.AES.encrypt(
      message.content,
      this.encryptionKey
    ).toString();

    this.socket.emit('night-chat-message', {
      ...message,
      gameId: this.gameId,
      encryptedContent,
      content: undefined, // Ne pas envoyer le contenu non chiffré
    });
  }

  // S'abonner aux nouveaux messages
  onMessage(callback: (message: NightChatMessage) => void) {
    if (!this.socket) {
      throw new Error('Not connected to chat service');
    }

    this.socket.on('night-chat-message', (encryptedMessage: any) => {
      const decryptedContent = CryptoJS.AES.decrypt(
        encryptedMessage.encryptedContent,
        this.encryptionKey
      ).toString(CryptoJS.enc.Utf8);

      const message: NightChatMessage = {
        ...encryptedMessage,
        content: decryptedContent,
      };

      callback(message);
    });
  }

  // Récupérer l'historique des messages
  async getMessageHistory(): Promise<NightChatMessage[]> {
    if (!this.socket || !this.gameId) {
      throw new Error('Not connected to chat service');
    }

    return new Promise((resolve) => {
      this.socket!.emit('get-night-chat-history', { gameId: this.gameId }, (encryptedMessages: any[]) => {
        const messages = encryptedMessages.map(encryptedMessage => {
          const decryptedContent = CryptoJS.AES.decrypt(
            encryptedMessage.encryptedContent,
            this.encryptionKey
          ).toString(CryptoJS.enc.Utf8);

          return {
            ...encryptedMessage,
            content: decryptedContent,
          };
        });

        resolve(messages);
      });
    });
  }
}

export const nightChatService = new NightChatService(); 