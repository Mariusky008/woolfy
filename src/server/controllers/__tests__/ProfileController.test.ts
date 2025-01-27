import { ProfileController } from '../ProfileController';
import { NotificationService } from '../../services/NotificationService';
import { Request, Response } from 'express';
import { User } from '../../models/User';
import { RoleStats } from '../../models/RoleStats';
import { GameHistory } from '../../models/GameHistory';
import { Badge } from '../../models/Badge';
import mongoose from 'mongoose';

jest.mock('../../services/NotificationService');
jest.mock('../../models/User');
jest.mock('../../models/RoleStats');
jest.mock('../../models/GameHistory');
jest.mock('../../models/Badge');

describe('ProfileController', () => {
  let profileController: ProfileController;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockUser: any;

  beforeEach(() => {
    mockNotificationService = {
      notifyGameUpdate: jest.fn(),
      notifyNewMessage: jest.fn()
    } as unknown as jest.Mocked<NotificationService>;
    
    profileController = new ProfileController(mockNotificationService);

    mockUser = {
      _id: new mongoose.Types.ObjectId(),
      username: 'testUser',
      avatar: 'avatar.jpg',
      bio: 'Test bio'
    };

    mockReq = {
      user: mockUser,
      params: { userId: mockUser._id.toString() }
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      mockReq.body = {
        avatar: 'new-avatar.jpg',
        bio: 'New bio'
      };

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

      await profileController.updateProfile(mockReq as Request, mockRes as Response);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        { avatar: 'new-avatar.jpg', bio: 'New bio' },
        { new: true }
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getUserBadges', () => {
    it('should return user badges', async () => {
      const mockBadges = [
        { name: 'First Win', rarity: 'common' },
        { name: 'Pro Player', rarity: 'rare' }
      ];

      (Badge.find as jest.Mock).mockResolvedValue(mockBadges);

      await profileController.getUserBadges(mockReq as Request, mockRes as Response);

      expect(Badge.find).toHaveBeenCalledWith({ userId: mockUser._id });
      expect(mockRes.json).toHaveBeenCalledWith(mockBadges);
    });
  });

  describe('getRoleStats', () => {
    it('should return role statistics', async () => {
      const mockStats = [
        { role: 'Villageois', gamesPlayed: 10, wins: 6, winRate: 0.6 },
        { role: 'Loup-Garou', gamesPlayed: 8, wins: 4, winRate: 0.5 }
      ];

      (RoleStats.find as jest.Mock).mockResolvedValue(mockStats);

      await profileController.getRoleStats(mockReq as Request, mockRes as Response);

      expect(RoleStats.find).toHaveBeenCalledWith({ userId: mockUser._id });
      expect(mockRes.json).toHaveBeenCalledWith(mockStats);
    });
  });

  describe('getGameHistory', () => {
    it('should return user game history', async () => {
      const mockHistory = [
        { 
          type: 'classic',
          date: new Date(),
          role: 'Villageois',
          result: 'winner'
        }
      ];

      (GameHistory.find as jest.Mock).mockResolvedValue(mockHistory);

      await profileController.getGameHistory(mockReq as Request, mockRes as Response);

      expect(GameHistory.find).toHaveBeenCalledWith({ 'players.userId': mockUser._id });
      expect(mockRes.json).toHaveBeenCalledWith(mockHistory);
    });
  });

  describe('checkBadges', () => {
    it('should check and award new badges', async () => {
      const mockNewBadge = { name: 'Win Streak', rarity: 'epic' };
      
      (Badge.create as jest.Mock).mockResolvedValue(mockNewBadge);
      mockNotificationService.notifyNewMessage.mockResolvedValue(undefined);

      await profileController.checkBadges(mockReq as Request, mockRes as Response);

      expect(mockNotificationService.notifyNewMessage).toHaveBeenCalledWith(
        mockUser._id,
        expect.objectContaining({
          type: 'badge',
          badge: mockNewBadge
        })
      );
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Badges checked successfully' });
    });
  });
}); 
