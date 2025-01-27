import { RankingService } from '../RankingService';
import { User, IUser } from '../../models/User';
import mongoose, { Types } from 'mongoose';
import 'jest';

describe('RankingService', () => {
  let rankingService: RankingService;

  beforeAll(async () => {
    // Connecter à la base de données de test
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/woolfy_test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    rankingService = new RankingService();
    await User.deleteMany({});
  });

  describe('updateUserRank', () => {
    it('should correctly update user rank based on points', async () => {
      // Créer un utilisateur avec des points
      const user = await User.create({
        username: 'testUser',
        email: 'test@test.com',
        password: 'password123',
        points: 4500
      }) as IUser & { _id: Types.ObjectId };

      const result = await rankingService.updateUserRank(user._id.toString());

      expect(result.rank).toBe('Loup Solitaire');
      expect(result.division).toBe(4);
      expect(result.points).toBe(4500);
      expect(result.position).toBe(1);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.rank).toBe('Loup Solitaire');
    });

    it('should handle multiple users and calculate positions correctly', async () => {
      // Créer plusieurs utilisateurs avec différents points
      const users = await Promise.all([
        User.create({ username: 'user1', email: 'user1@test.com', password: 'pass123', points: 8000 }),
        User.create({ username: 'user2', email: 'user2@test.com', password: 'pass123', points: 12000 }),
        User.create({ username: 'user3', email: 'user3@test.com', password: 'pass123', points: 4000 }),
      ]) as (IUser & { _id: Types.ObjectId })[];

      const results = await Promise.all(
        users.map(user => rankingService.updateUserRank(user._id.toString()))
      );

      // Vérifier les rangs
      expect(results[0].rank).toBe('Loup Alpha');
      expect(results[1].rank).toBe('Loup Légendaire');
      expect(results[2].rank).toBe('Loup Solitaire');

      // Vérifier les positions
      expect(results[1].position).toBe(1); // user2 (12000 points)
      expect(results[0].position).toBe(2); // user1 (8000 points)
      expect(results[2].position).toBe(3); // user3 (4000 points)
    });
  });

  describe('getGlobalRanking', () => {
    it('should return paginated global ranking', async () => {
      // Créer 15 utilisateurs avec des points aléatoires
      await Promise.all(
        Array.from({ length: 15 }, (_, i) => 
          User.create({
            username: `user${i}`,
            email: `user${i}@test.com`,
            password: 'pass123',
            points: Math.floor(Math.random() * 20000)
          })
        )
      );

      const result = await rankingService.getGlobalRanking(1, 10);

      expect(result.rankings.length).toBe(10);
      expect(result.total).toBe(15);
      expect(result.rankings[0].position).toBe(1);
      expect(result.rankings[9].position).toBe(10);
    });
  });

  describe('getUserRankingContext', () => {
    it('should return correct context around user', async () => {
      // Créer 10 utilisateurs avec des points spécifiques
      const users = await Promise.all(
        Array.from({ length: 10 }, (_, i) => 
          User.create({
            username: `user${i}`,
            email: `user${i}@test.com`,
            password: 'pass123',
            points: (i + 1) * 1000
          })
        )
      ) as (IUser & { _id: Types.ObjectId })[];

      const middleUser = users[4]; // 5000 points
      const context = await rankingService.getUserRankingContext(middleUser._id.toString());

      expect(context.above.length).toBe(2);
      expect(context.below.length).toBe(2);
      expect(context.user.points).toBe(5000);
      expect(context.above[0].points).toBe(7000);
      expect(context.above[1].points).toBe(6000);
      expect(context.below[0].points).toBe(4000);
      expect(context.below[1].points).toBe(3000);
    });
  });
}); 