import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      isVerified: false,
    });

    if (user) {
      // Générer le token de vérification
      const verificationToken = user.getVerificationToken();
      await user.save({ validateBeforeSave: false });

      // Envoyer l'email de vérification
      const verifyUrl = `${process.env.FRONTEND_URL || 'https://footlockerdz.vercel.app'}/verify/${verificationToken}`;
      const message = `Vous avez créé un compte sur FootLockerDZ. Cliquez sur ce lien pour vérifier votre adresse email : \n\n ${verifyUrl}`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Vérifiez votre adresse email - FootLockerDZ',
          message,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #006233; text-align: center;">Bienvenue sur FootLockerDZ !</h2>
              <p>Bonjour <strong>${user.name || 'Cher client'}</strong>,</p>
              <p>Merci d'avoir créé un compte sur notre boutique. Pour activer votre compte et commencer vos achats, veuillez confirmer votre adresse email :</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="background-color: #006233; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Activer mon compte</a>
              </div>
              <p style="color: #666; font-size: 13px;">Si le bouton ne fonctionne pas, cliquez sur ce lien :<br><a href="${verifyUrl}">${verifyUrl}</a></p>
            </div>
          `,
        });
      } catch (err) {
        console.error("Erreur lors de l'envoi de l'email :", err.message);
      }

      res.status(201).json({
        success: true,
        message: 'Un lien de vérification a été envoyé à votre adresse email. Veuillez cliquer dessus pour activer votre compte.',
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: false,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Bloquer si le compte est suspendu
      if (user.isBlocked) {
        return res.status(403).json({ message: 'Votre compte a été suspendu par le Super Admin.' });
      }

      // Bloquer si non vérifié
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Veuillez vérifier votre email avant de vous connecter.' });
      }

      generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role,
        isVerified: user.isVerified,
        addresses: user.addresses,
        defaultAddressId: user.defaultAddressId,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      // Pour éviter les erreurs 401 dans la console quand l'utilisateur n'est pas connecté
      return res.status(200).json(null);
    }

    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role,
        isVerified: user.isVerified,
        addresses: user.addresses,
        defaultAddressId: user.defaultAddressId,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.phone = req.body.phone || user.phone;
      user.gender = req.body.gender || user.gender;

      // Update email if provided and not already taken
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ message: 'L\'email est déjà utilisé' });
        }
        user.email = req.body.email;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        addresses: updatedUser.addresses,
        defaultAddressId: updatedUser.defaultAddressId,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email vérifié avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot
// @access  Public
export const forgotPassword = async (req, res) => {
  const { identifier } = req.body; // could be email

  try {
    const user = await User.findOne({ email: identifier });

    if (!user) {
      return res.status(404).json({ message: 'Aucun utilisateur avec cet email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset/${resetToken}`;
    const message = `Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur ce lien : \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Réinitialisation du mot de passe',
        message,
        html: `<p>Vous avez demandé à réinitialiser votre mot de passe.</p><p>Cliquez sur ce lien :</p><a href="${resetUrl}" target="_blank">Réinitialiser mon mot de passe</a>`,
      });

      res.status(200).json({ success: true, message: 'Email envoyé' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset
// @access  Public
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Mot de passe réinitialisé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const { oldPassword, newPassword } = req.body;

      if (!await user.matchPassword(oldPassword)) {
        return res.status(401).json({ message: 'L\'ancien mot de passe est incorrect' });
      }

      user.password = newPassword;
      await user.save();

      res.status(200).json({ success: true, message: 'Mot de passe mis à jour avec succès' });
    } else {
      res.status(404).json({ message: 'Utilisateur introuvable' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Address Controllers ---

export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newAddress = {
      label: req.body.label,
      wilayaCode: req.body.wilayaCode,
      commune: req.body.commune,
      street: req.body.street,
      phone: req.body.phone,
    };

    user.addresses.push(newAddress);
    
    if (user.addresses.length === 1) {
      // If it's the first address, make it default
      user.defaultAddressId = user.addresses[0]._id;
    }

    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    address.label = req.body.label || address.label;
    address.wilayaCode = req.body.wilayaCode || address.wilayaCode;
    address.commune = req.body.commune || address.commune;
    address.street = req.body.street || address.street;
    address.phone = req.body.phone || address.phone;

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.addresses.pull(req.params.id);

    if (user.defaultAddressId && user.defaultAddressId.toString() === req.params.id) {
      user.defaultAddressId = user.addresses.length > 0 ? user.addresses[0]._id : null;
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    user.defaultAddressId = address._id;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
