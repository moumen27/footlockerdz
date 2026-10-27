import Settings from '../models/Settings.model.js';

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default if it doesn't exist
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/SuperAdmin
export const updateSettings = async (req, res) => {
  try {
    const { whatsappNumber, phones, socials, maintenanceFlag, shippingRates, freeShippingThreshold, flashSale } = req.body;
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
    if (phones !== undefined) settings.phones = phones;
    if (socials !== undefined) settings.socials = socials;
    if (maintenanceFlag !== undefined) settings.maintenanceFlag = maintenanceFlag;
    if (shippingRates !== undefined) settings.shippingRates = shippingRates;
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = freeShippingThreshold;
    if (flashSale !== undefined) settings.flashSale = flashSale;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
