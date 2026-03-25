const socketio = require('socket.io');

let io;

const init = (server) => {
  io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('leave', (room) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room: ${room}`);
    });

    // Handle chat messages - save to DB and broadcast
    socket.on('CHAT_MESSAGE', async (data) => {
      try {
        const Message = require('../models/Message');
        const { orderId, message, sender, senderId, senderName } = data;

        if (!orderId || !message) {
          console.log('Invalid chat message data');
          return;
        }

        // Save message to database
        const newMessage = await Message.create({
          orderId,
          sender: sender.toLowerCase(),
          senderId,
          message
        });

        // Format message for broadcast
        const broadcastData = {
          _id: newMessage._id,
          orderId,
          sender,
          senderId,
          senderName,
          message,
          createdAt: newMessage.createdAt,
          isRead: false
        };

        // Broadcast to all in the order room EXCEPT sender
        socket.to(`order_${orderId}`).emit('CHAT_MESSAGE', broadcastData);
        
        console.log(`Chat message sent in order ${orderId}`);
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
    });

    // Handle rider location updates
    socket.on('RIDER_LOCATION', async (data) => {
      try {
        const Location = require('../models/Location');
        const { orderId, riderId, lat, lng, accuracy, speed, heading } = data;

        if (!lat || !lng) {
          console.log('Invalid location data');
          return;
        }

        // Save location to database
        const location = await Location.create({
          riderId,
          orderId: orderId || null,
          location: { lat, lng },
          accuracy: accuracy || 0,
          speed: speed || 0,
          heading: heading || 0
        });

        // Broadcast to all in the order room EXCEPT sender
        if (orderId) {
          socket.to(`order_${orderId}`).emit('RIDER_LOCATION_CHANGED', {
            orderId,
            riderId,
            location: { lat, lng },
            accuracy,
            speed,
            heading,
            createdAt: location.createdAt
          });
        }

        console.log(`Rider location updated for order ${orderId}`);
      } catch (error) {
        console.error('Error saving location:', error);
      }
    });

    // Handle typing indicator
    socket.on('TYPING', (data) => {
      const { orderId, sender, senderName } = data;
      if (orderId) {
        socket.to(`order_${orderId}`).emit('USER_TYPING', { sender, senderName });
      }
    });

    socket.on('STOP_TYPING', (data) => {
      const { orderId, sender } = data;
      if (orderId) {
        socket.to(`order_${orderId}`).emit('USER_STOPPED_TYPING', { sender });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const emitEvent = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

module.exports = {
  init,
  emitEvent,
  emitToRoom,
};
