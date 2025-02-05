import { io, Socket } from 'socket.io-client';
import { Player } from '../types/messages';
import {
  ProtectionAction,
  SpyAction,
  ManipulationAction,
  VengeanceAction,
  SpecialActionEvent,
  SpecialActionResponse
} from '../types/specialActions';

class SpecialPowersService {
  private socket: Socket | null = null;
  private currentNight: number = 0;
  private protectionHistory: ProtectionAction[] = [];
  private spyHistory: SpyAction[] = [];
  private manipulationHistory: ManipulationAction[] = [];
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    this.connect();
  }

  private connect() {
    // Use relative path for WebSocket connection to go through Vite proxy
    this.socket = io('/', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
      forceNew: true,
      timeout: 10000
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        transport: this.socket?.io?.engine?.transport?.name,
        attempt: ++this.reconnectAttempts
      });

      // Try to reconnect with polling if WebSocket fails
      if (this.socket?.io?.engine?.transport?.name === 'websocket' && this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log('Retrying with polling transport...');
        this.socket.io.opts.transports = ['polling', 'websocket'];
      }
    });

    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        transport: this.socket?.io?.engine?.transport?.name
      });
    });

    this.socket.on('connect', () => {
      console.log('Connected to special powers service:', {
        socketId: this.socket?.id,
        transport: this.socket?.io?.engine?.transport?.name,
        connected: this.socket?.connected,
        attempts: this.reconnectAttempts
      });
      
      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from special powers service:', {
        reason,
        socketId: this.socket?.id,
        transport: this.socket?.io?.engine?.transport?.name,
        attempts: this.reconnectAttempts
      });
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to special powers service:', {
        attemptNumber,
        socketId: this.socket?.id,
        transport: this.socket?.io?.engine?.transport?.name
      });
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        transport: this.socket?.io?.engine?.transport?.name,
        attempts: this.reconnectAttempts
      });
    });

    this.socket.on('reconnect_attempt', () => {
      console.log('Attempting to reconnect:', {
        attempt: this.reconnectAttempts + 1,
        transport: this.socket?.io?.engine?.transport?.name
      });
    });

    this.socket.on('reconnecting', (attemptNumber) => {
      console.log('Reconnecting...', {
        attemptNumber,
        transport: this.socket?.io?.engine?.transport?.name
      });
    });

    this.socket.on('nightUpdate', (night: number) => {
      this.currentNight = night;
      console.log('Night updated:', {
        night,
        socketId: this.socket?.id,
        transport: this.socket?.io?.engine?.transport?.name
      });
    });

    this.socket.on('specialActionResponse', (response: SpecialActionResponse) => {
      console.log('Special action response:', {
        response,
        socketId: this.socket?.id,
        transport: this.socket?.io?.engine?.transport?.name
      });
    });

    // Handle transport changes
    this.socket.io.engine?.on('upgrade', (transport) => {
      console.log('Transport upgraded:', {
        from: this.socket?.io?.engine?.transport?.name,
        to: transport.name
      });
    });

    // Handle close events
    this.socket.io.engine?.on('close', (reason) => {
      console.log('Transport closed:', {
        reason,
        transport: this.socket?.io?.engine?.transport?.name
      });
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to special powers service');
      console.log('Socket ID:', this.socket?.id);
      console.log('Socket connected:', this.socket?.connected);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from special powers service');
      console.log('Disconnect reason:', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to special powers service', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    this.socket.on('reconnect_attempt', () => {
      console.log('Attempting to reconnect...');
    });

    this.socket.on('reconnecting', (attemptNumber) => {
      console.log('Reconnecting...', attemptNumber);
    });

    this.socket.on('nightUpdate', (night: number) => {
      this.currentNight = night;
      console.log('Night updated:', night);
    });

    this.socket.on('specialActionResponse', (response: SpecialActionResponse) => {
      console.log('Special action response:', response);
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public async protectPlayer(protector: Player, target: Player): Promise<SpecialActionResponse> {
    if (!this.socket) {
      return { success: false, message: 'Not connected to server' };
    }

    // Check if protector has already protected this player this night
    const hasProtectedBefore = this.protectionHistory.some(
      action => action.protector.id === protector.id && 
                action.target.id === target.id &&
                action.night === this.currentNight
    );

    if (hasProtectedBefore) {
      return { success: false, message: 'You cannot protect the same player twice in one night' };
    }

    const action: ProtectionAction = {
      protector,
      target,
      night: this.currentNight
    };

    return new Promise((resolve) => {
      this.socket!.emit('specialAction', {
        type: 'PROTECT',
        action
      } as SpecialActionEvent, (response: SpecialActionResponse) => {
        if (response.success) {
          this.protectionHistory.push(action);
        }
        resolve(response);
      });
    });
  }

  public async spyOnConversation(spy: Player, targetConversation: string): Promise<SpecialActionResponse> {
    if (!this.socket) {
      return { success: false, message: 'Not connected to server' };
    }

    // Check if spy has already used their ability this night
    const hasSpiedThisNight = this.spyHistory.some(
      action => action.spy.id === spy.id && action.night === this.currentNight
    );

    if (hasSpiedThisNight) {
      return { success: false, message: 'You can only spy once per night' };
    }

    const action: SpyAction = {
      spy,
      targetConversation,
      night: this.currentNight
    };

    return new Promise((resolve) => {
      this.socket!.emit('specialAction', {
        type: 'SPY',
        action
      } as SpecialActionEvent, (response: SpecialActionResponse) => {
        if (response.success) {
          this.spyHistory.push(action);
        }
        resolve(response);
      });
    });
  }

  public async manipulateVote(puppeteer: Player, target: Player, forcedVote: Player): Promise<SpecialActionResponse> {
    if (!this.socket) {
      return { success: false, message: 'Not connected to server' };
    }

    const action: ManipulationAction = {
      puppeteer,
      target,
      forcedVote
    };

    return new Promise((resolve) => {
      this.socket!.emit('specialAction', {
        type: 'MANIPULATE',
        action
      } as SpecialActionEvent, resolve);
    });
  }

  public async executeVengeance(shadow: Player, target: Player, chainKill: boolean): Promise<SpecialActionResponse> {
    if (!this.socket) {
      return { success: false, message: 'Not connected to server' };
    }

    const action: VengeanceAction = {
      shadow,
      target,
      chainKill
    };

    return new Promise((resolve) => {
      this.socket!.emit('specialAction', {
        type: 'VENGEANCE',
        action
      } as SpecialActionEvent, resolve);
    });
  }

  public hasUsedAbilityThisNight(player: Player): boolean {
    return (
      this.protectionHistory.some(action => 
        action.protector.id === player.id && action.night === this.currentNight
      ) ||
      this.spyHistory.some(action =>
        action.spy.id === player.id && action.night === this.currentNight
      )
    );
  }
}

export const specialPowersService = new SpecialPowersService(); 