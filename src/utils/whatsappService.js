/**
 * WhatsApp Service for sending order status updates.
 * For production, this should integrate with a provider like Twilio, WPPConnect, or UltraMsg.
 * For now, we'll implement a flexible structure that can be easily connected to an API.
 */

const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL;
    this.token = process.env.WHATSAPP_TOKEN;
    this.isEnabled = process.env.WHATSAPP_ENABLED === 'true';
  }

  async sendStatusUpdate(phone, orderId, status, customerName) {
    if (!this.isEnabled) {
      console.log(`[WhatsApp Mock] Sending "${status}" update for Order ${orderId} to ${phone}`);
      return;
    }

    try {
      const message = `Halo ${customerName}, update for your DeliverFree Order #${orderId.toString().substring(18)}: Status is now ${status}.`;
      
      // Example implementation for a generic WhatsApp API
      await axios.post(this.apiUrl, {
        to: phone,
        message: message,
        token: this.token
      });

      console.log(`WhatsApp message sent to ${phone}`);
    } catch (err) {
      console.error('WhatsApp Service Error:', err.message);
    }
  }

  async sendNewOrderNotification(phone, restaurantName, amount) {
    if (!this.isEnabled) {
      console.log(`[WhatsApp Mock] Notifying Rider ${phone} of new order from ${restaurantName} (Rs. ${amount})`);
      return;
    }
    // ... similar logic
  }
}

module.exports = new WhatsAppService();
