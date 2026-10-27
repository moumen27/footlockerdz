import User from '../models/User.js';

// @desc    Get all admin users
// @route   GET /api/users/admin
// @access  Private/SuperAdmin
export const getAdminUsers = async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin_catalog', 'admin_orders', 'super_admin'] } }).select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new admin
// @route   POST /api/users/admin
// @access  Private/SuperAdmin
export const createAdminUser = async (req, res) => {
  try {
    const { email, password, role, name, firstName, lastName } = req.body;
    
    if (!['admin_catalog', 'admin_orders', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const user = await User.create({
      email,
      password,
      role,
      name,
      firstName,
      lastName,
      isVerified: true
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked
      });
    } else {
      res.status(400).json({ message: 'Données utilisateur invalides' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admin (role or block status)
// @route   PATCH /api/users/admin/:id
// @access  Private/SuperAdmin
export const updateAdminUser = async (req, res) => {
  try {
    const { role, isBlocked } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Prevent blocking or demoting oneself (super_admin)
    if (user._id.toString() === req.user._id.toString() && (isBlocked === true || role !== 'super_admin')) {
      return res.status(400).json({ message: 'Vous ne pouvez pas modifier votre propre statut ou vous rétrograder' });
    }

    if (role) {
      if (!['admin_catalog', 'admin_orders', 'super_admin'].includes(role)) {
        return res.status(400).json({ message: 'Rôle invalide' });
      }
      user.role = role;
    }

    if (isBlocked !== undefined) {
      user.isBlocked = isBlocked;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      isBlocked: updatedUser.isBlocked
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
