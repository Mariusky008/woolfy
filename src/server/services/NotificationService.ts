import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { IGame } from '../models/Game';
import { Types } from 'mongoose';

export class NotificationService {
  private io: SocketServer;
  private userSockets: Map<string, string[]> = new Map();

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://woolfy.fr', 'https://www.woolfy.fr']
          : 'http://localhost:5173',
        credentials: true
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Nouvelle connexion socket:', socket.id);

      // Authentification du socket
      socket.on('authenticate', (userId: string) => {
        this.addUserSocket(userId, socket.id);
        socket.join(`user:${userId}`);
        console.log(`Utilisateur ${userId} authentifié sur le socket ${socket.id}`);
      });

      // Déconnexion
      socket.on('disconnect', () => {
        this.removeSocket(socket.id);
        console.log('Socket déconnecté:', socket.id);
      });
    });
  }

  // Ajouter un socket pour un utilisateur
  private addUserSocket(userId: string, socketId: string) {
    const userSocketIds = this.userSockets.get(userId) || [];
    userSocketIds.push(socketId);
    this.userSockets.set(userId, userSocketIds);
  }

  // Retirer un socket
  private removeSocket(socketId: string) {
    this.userSockets.forEach((sockets, userId) => {
      const index = sockets.indexOf(socketId);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        } else {
          this.userSockets.set(userId, sockets);
        }
      }
    });
  }

  // Notifier un utilisateur d'un nouveau message
  notifyNewMessage(userId: Types.ObjectId | string, message: any) {
    this.io.to(`user:${userId}`).emit('newMessage', message);
  }

  // Notifier un utilisateur que des messages ont été lus
  notifyMessagesRead(userId: Types.ObjectId | string, messageIds: string[]) {
    this.io.to(`user:${userId}`).emit('messagesRead', messageIds);
  }

  // Notifier un utilisateur d'une nouvelle invitation de jeu
  notifyGameInvitation(userId: Types.ObjectId | string, invitation: any) {
    this.io.to(`user:${userId}`).emit('gameInvitation', invitation);
  }

  // Notifier un utilisateur de la réponse à une invitation
  notifyInvitationResponse(userId: Types.ObjectId | string, response: any) {
    this.io.to(`user:${userId}`).emit('invitationResponse', response);
  }

  // Notifier un utilisateur qu'il est déconnecté
  notifyUserDisconnected(userId: Types.ObjectId | string) {
    this.io.to(`user:${userId}`).emit('forceDisconnect', {
      message: 'Vous avez été déconnecté'
    });
  }

  // Notify when a player joins a game
  notifyPlayerJoined(game: IGame, username: string) {
    this.io.to(`game:${game._id}`).emit('playerJoined', {
      gameId: game._id,
      username,
      currentPlayers: game.players.current,
      maxPlayers: game.players.max,
      minToStart: Math.ceil(game.players.min * 0.7)
    });
  }

  // Notify when a game is about to start
  notifyGameStarting(game: IGame) {
    this.io.to(`game:${game._id}`).emit('gameStarting', {
      gameId: game._id,
      message: 'La partie va commencer dans 1 minute !',
      startTime: new Date(Date.now() + 60000)
    });
  }

  // Notify when a game has started
  notifyGameStarted(game: IGame) {
    this.io.to(`game:${game._id}`).emit('gameStarted', {
      gameId: game._id,
      message: 'La partie commence maintenant !'
    });
  }

  // Notify about game status updates
  notifyGameUpdate(game: IGame, message: string) {
    this.io.to(`game:${game._id}`).emit('gameUpdate', {
      gameId: game._id,
      message,
      status: game.status,
      currentPlayers: game.players.current
    });
  }
} 