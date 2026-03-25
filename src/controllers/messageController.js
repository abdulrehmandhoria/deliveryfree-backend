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

exports.getConversations = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  
  let restaurantFilter = {};
  let riderFilter = {};
  
  if (req.user.role === 'RESTAURANT') {
    restaurantFilter = { restaurant: req.user._id };
  } else if (req.user.role === 'RIDER') {
    riderFilter = { rider: req.user._id };
  }
  
  const ordersWithMessages = await Order.find({
    $or: [
      restaurantFilter,
      riderFilter
    ],
    _id: { $in: await Message.distinct('orderId') }
  })
  .select('customerName customerPhone status createdAt')
  .sort('-createdAt');

  const conversations = await Promise.all(
    ordersWithMessages.map(async (order) => {
      const lastMessage = await Message.findOne({ orderId: order._id })
        .sort('-createdAt');
      
      const unreadCount = await Message.countDocuments({
        orderId: order._id,
        senderId: { $ne: req.user._id },
        isRead: false
      });

      return {
        orderId: order._id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        status: order.status,
        lastMessage: lastMessage?.message || '',
        lastMessageTime: lastMessage?.createdAt || order.createdAt,
        unreadCount
      };
    })
  );

  res.status(200).json({
    status: 'success',
    results: conversations.length,
    data: { conversations }
  });
});
