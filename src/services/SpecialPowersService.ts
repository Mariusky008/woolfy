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

  constructor() {
    this.connect();
  }

  private connect() {
    this.socket = io(import.meta.env.VITE_API_URL, {
      path: '/special-powers'
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('nightUpdate', (night: number) => {
      this.currentNight = night;
    });

    this.socket.on('specialActionResponse', (response: SpecialActionResponse) => {
      // Handle response if needed
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