import { Router } from 'express'
import { MessageController } from '../controllers/MessageController'
import { authenticateUser } from '../middleware/auth'

const router = Router()
const messageController = new MessageController()

// Middleware d'authentification pour toutes les routes
router.use(authenticateUser)

// Récupérer toutes les conversations de l'utilisateur
router.get('/conversations', messageController.getConversations)

// Récupérer les messages d'une conversation
router.get('/:userId', messageController.getMessages)

// Marquer les messages comme lus
router.put('/:userId/read', messageController.markAsRead)

// Envoyer un message
router.post('/:userId', messageController.sendMessage)

// Répondre à une invitation de jeu
router.post('/game-invite/:messageId/respond', messageController.respondToGameInvitation)

export { router as messageRoutes } 