const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');

exports.getPublicTracking = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('restaurant rider');
  
  if (!order) {
    return res.status(404).send('<h1>Order not found</h1>');
  }

  // Simple HTML for public tracking
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Track Your Order - DeliverFree</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .card { background: white; padding: 20px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: auto; }
            .status { font-weight: bold; color: #4B46FF; font-size: 20px; margin-bottom: 10px; }
            .info { color: #666; margin-bottom: 20px; }
            #map { height: 300px; background: #eee; border-radius: 10px; margin-top: 20px; display: flex; align-items: center; justify-content: center; color: #999; }
        </style>
        <script src="/socket.io/socket.io.js"></script>
    </head>
    <body>
        <div class="card">
            <h1>DeliverFree</h1>
            <div class="status">Status: ${order.status}</div>
            <div class="info">Restuarant: ${order.restaurant?.name}<br>Rider: ${order.rider?.name || 'Assigning...'}</div>
            <div id="map">Live Map View (GPS: <span id="coords">Waiting...</span>)</div>
        </div>

        <script>
            const socket = io();
            const orderId = "${order._id}";
            const coordsSpan = document.getElementById('coords');

            socket.emit('join', 'order_' + orderId);
            
            socket.on('RIDER_LOCATION_CHANGED', (data) => {
                if (data.orderId === orderId) {
                    coordsSpan.innerText = data.location.lat.toFixed(5) + ", " + data.location.lng.toFixed(5);
                    // In a real app, we'd integrate Google Maps JS SDK here
                }
            });
        </script>
    </body>
    </html>
  `;

  res.send(html);
});
