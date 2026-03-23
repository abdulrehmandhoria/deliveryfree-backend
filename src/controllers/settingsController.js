const Settings = require('../models/Settings');
const cache = require('../utils/cache');

exports.getSettings = async (req, res) => {
  try {
    const cachedSettings = cache.get('system_settings');
    if (cachedSettings) {
      return res.status(200).json({ success: true, settings: cachedSettings });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ whatsappNumber: '+923000000000' });
    }
    
    cache.set('system_settings', settings);
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { whatsappNumber, supportEmail } = req.body;
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({ whatsappNumber, supportEmail });
    } else {
      settings.whatsappNumber = whatsappNumber || settings.whatsappNumber;
      settings.supportEmail = supportEmail || settings.supportEmail;
      await settings.save();
    }
    
    cache.del('system_settings');
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
