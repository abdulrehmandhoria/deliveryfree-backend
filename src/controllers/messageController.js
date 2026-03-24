const Message = require('../models/Message');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createMessage = catchAsync(async (req, res, next) => {
  const { orderId, message } = req.body;
  const sender = req.user.role.toUpperCase();
  
  const newMessage = await Message.create({
    orderId,
    sender: sender.toLowerCase(),
    senderId: req.user._id,
    message
  });

  res.status(201).json({
    status: 'success',
    data: {
      message: newMessage
    }
  });
});

exports.getMessagesByOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { limit = 50 } = req.query;

  const messages = await Message.find({ orderId })
    .sort('-createdAt')
    .limit(parseInt(limit))
    .populate('senderId', 'name role');

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: {
      messages: messages.reverse()
    }
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  await Message.updateMany(
    { 
      orderId, 
      senderId: { $ne: userId },
      isRead: false 
    },
    { isRead: true }
  );

  res.status(200).json({
    status: 'success'
  });
});

exports.deleteMessage = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;
  
  const message = await Message.findById(messageId);
  
  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  if (message.senderId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    return next(new AppError('You can only delete your own messages', 403));
  }

  await Message.findByIdAndDelete(messageId);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
