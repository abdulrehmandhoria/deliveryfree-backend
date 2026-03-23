let io;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      socket.on('join', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
      });

      socket.on('LOCATION_UPDATE', (data) => {
        const { orderId, location } = data;
        if (orderId && location) {
          // Broadcast to everyone in the order-specific room (Restaurant, Admin, Customer)
          io.to(`order_${orderId}`).emit('RIDER_LOCATION_CHANGED', { orderId, location });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  emitEvent: (event, data, room = null) => {
    if (io) {
      if (room) {
        io.to(room).emit(event, data);
      } else {
        io.emit(event, data);
      }
    }
  },
};
