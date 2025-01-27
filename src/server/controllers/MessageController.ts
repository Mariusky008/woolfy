import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { Message } from '../models/Message'
import { User } from '../models/User'
import { getSocketService } from '../services/SocketService'

export class MessageController {
  // Récupérer toutes les conversations d'un utilisateur
  async getConversations(req: Request, res: Response) {
    try {
      const userId = req.session.userId
      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' })
      }

      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { from: new Types.ObjectId(userId) },
              { to: new Types.ObjectId(userId) }
            ]
          }
        },
        {
          $sort: { timestamp: -1 }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$from', new Types.ObjectId(userId)] },
                '$to',
                '$from'
              ]
            },
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  { $and: [
                    { $eq: ['$to', new Types.ObjectId(userId)] },
                    { $eq: ['$read', false] }
                  ]},
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: 1,
            username: '$user.username',
            avatar: '$user.avatar',
            lastMessage: {
              content: '$lastMessage.content',
              timestamp: '$lastMessage.timestamp',
              type: '$lastMessage.type'
            },
            unreadCount: 1
          }
        }
      ])

      res.json(conversations)
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error)
      res.status(500).json({ message: 'Erreur serveur' })
    }
  }

  // Récupérer les messages d'une conversation
  async getMessages(req: Request, res: Response) {
    try {
      const userId = req.session.userId
      const otherUserId = req.params.userId

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' })
      }

      const messages = await Message.find({
        $or: [
          { from: userId, to: otherUserId },
          { from: otherUserId, to: userId }
        ]
      })
        .sort({ timestamp: -1 })
        .limit(50)
        .populate('from', 'username')
        .lean()

      res.json(messages.reverse())
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error)
      res.status(500).json({ message: 'Erreur serveur' })
    }
  }

  // Marquer les messages comme lus
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.session.userId
      const otherUserId = req.params.userId

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' })
      }

      await Message.updateMany(
        {
          from: otherUserId,
          to: userId,
          read: false
        },
        {
          $set: { read: true }
        }
      )

      res.json({ success: true })
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error)
      res.status(500).json({ message: 'Erreur serveur' })
    }
  }

  // Envoyer un message
  async sendMessage(req: Request, res: Response) {
    try {
      const userId = req.session.userId
      const { to, content, type = 'text' } = req.body

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' })
      }

      const sender = await User.findById(userId)
      if (!sender) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' })
      }

      const message = await Message.create({
        from: userId,
        fromUsername: sender.username,
        to,
        content,
        type,
        timestamp: new Date(),
        read: false
      })

      try {
        // Notifier le destinataire via Socket.IO
        const socketService = getSocketService()
        socketService.notifyUser(to, 'new_message', message)
      } catch (socketError) {
        console.warn('Erreur Socket.IO:', socketError)
        // On continue même si la notification échoue
      }

      res.json(message)
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      res.status(500).json({ message: 'Erreur serveur' })
    }
  }

  // Répondre à une invitation de jeu
  async respondToGameInvitation(req: Request, res: Response) {
    try {
      const userId = req.session.userId
      const messageId = req.params.messageId
      const { accepted } = req.body

      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' })
      }

      const message = await Message.findById(messageId)
      if (!message) {
        return res.status(404).json({ message: 'Message non trouvé' })
      }

      if (message.to.toString() !== userId) {
        return res.status(403).json({ message: 'Non autorisé' })
      }

      if (message.type !== 'game_invite') {
        return res.status(400).json({ message: 'Ce message n\'est pas une invitation' })
      }

      message.gameInvite = {
        ...message.gameInvite,
        status: accepted ? 'accepted' : 'rejected'
      }
      await message.save()

      // Notifier l'expéditeur de la réponse via Socket.IO
      socketService.notifyUser(message.from.toString(), 'game_invite_response', {
        messageId,
        accepted
      })

      res.json(message)
    } catch (error) {
      console.error('Erreur lors de la réponse à l\'invitation:', error)
      res.status(500).json({ message: 'Erreur serveur' })
    }
  }
} 