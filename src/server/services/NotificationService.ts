import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { IGame } from '../models/Game';

export class NotificationService {
  private io: SocketServer;

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
      console.log('Client connected:', socket.id);

      // Join game room when registering
      socket.on('joinGame', (gameId: string) => {
        socket.join(`game:${gameId}`);
      });

      // Leave game room when unregistering
      socket.on('leaveGame', (gameId: string) => {
        socket.leave(`game:${gameId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
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