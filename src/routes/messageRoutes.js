const express = require('express');
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', messageController.createMessage);
router.get('/order/:orderId', messageController.getMessagesByOrder);
router.get('/conversations', messageController.getConversations);
router.patch('/order/:orderId/read', messageController.markAsRead);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
