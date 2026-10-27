import Banner from '../models/Banner.model.js';

// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
export const getActiveBanners = async (req, res) => {
  try {
    const currentDate = new Date();
    // Banners that are active AND (have no schedule OR schedule is valid)
    const banners = await Banner.find({
      isActive: true,
      $or: [
        { 'schedule.startDate': { $exists: false } },
        { 'schedule.startDate': null },
        {
          'schedule.startDate': { $lte: currentDate },
          $or: [
            { 'schedule.endDate': { $exists: false } },
            { 'schedule.endDate': null },
            { 'schedule.endDate': { $gte: currentDate } }
          ]
        }
      ]
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all banners (Admin)
// @route   GET /api/banners/all
// @access  Private/SuperAdmin
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/SuperAdmin
export const createBanner = async (req, res) => {
  try {
    const banner = new Banner(req.body);
    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/SuperAdmin
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({ message: 'Bannière introuvable' });
    }

    res.json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/SuperAdmin
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Bannière introuvable' });
    }
    res.json({ message: 'Bannière supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
