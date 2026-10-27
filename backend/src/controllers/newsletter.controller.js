import Newsletter from '../models/Newsletter.model.js';
import Settings from '../models/Settings.model.js';
import Product from '../models/Product.model.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Veuillez fournir une adresse email valide.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let subscriber = await Newsletter.findOne({ email: cleanEmail });

    if (subscriber) {
      if (subscriber.active) {
        return res.status(200).json({ 
          message: 'Vous êtes déjà inscrit à notre newsletter !',
          alreadySubscribed: true 
        });
      }
      subscriber.active = true;
      subscriber.subscribedAt = new Date();
      await subscriber.save();
    } else {
      subscriber = await Newsletter.create({ email: cleanEmail });
    }

    // Optional welcome email
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      await sendEmail({
        email: cleanEmail,
        subject: 'Bienvenue chez FootLockerDZ ! 👟',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
            <div style="text-align: center; padding: 20px 0;">
              <h1 style="color: #111827; margin: 0; font-size: 26px;">FOOTLOCKER<span style="color: #006233;">DZ</span></h1>
              <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">100% Authentique &bull; Sneakers & Sport</p>
            </div>
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Bienvenue dans le club ! 🎉</h2>
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
                Merci de vous être inscrit à notre newsletter. Vous serez le premier informé de nos arrivages exclusifs, nos ventes flash et nos conseils de style.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${frontendUrl}/shop" style="background-color: #006233; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
                  Explorer la boutique
                </a>
              </div>
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
                FootLockerDZ &bull; Didouche Mourad, Alger &bull; Algérie
              </p>
            </div>
          </div>
        `
      });
    } catch (mailErr) {
      console.warn('Welcome email could not be sent:', mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Merci pour votre inscription ! Vous recevrez nos offres et nouveautés en avant-première.'
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ message: "Une erreur est survenue lors de l'inscription." });
  }
};

// @desc    Get subscribers stats (count)
// @route   GET /api/newsletter/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const totalActive = await Newsletter.countDocuments({ active: true });
    res.status(200).json({ count: totalActive });
  } catch (error) {
    console.error('Newsletter stats error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques.' });
  }
};

// @desc    Broadcast Flash Sale to all subscribers
// @route   POST /api/newsletter/broadcast-flash-sale
// @access  Private/Admin
export const broadcastFlashSale = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const flashSale = settings?.flashSale;

    if (!flashSale || !flashSale.active) {
      return res.status(400).json({ message: "La vente flash n'est pas active dans vos paramètres." });
    }

    const subscribers = await Newsletter.find({ active: true }).select('email');
    if (!subscribers || subscribers.length === 0) {
      return res.status(400).json({ message: "Aucun abonné inscrit à la newsletter pour le moment." });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const discount = flashSale.discountPercentage || 50;
    const title = flashSale.title?.fr || 'VENTE FLASH EXCEPTIONNELLE';
    const subtitle = flashSale.subtitle?.fr || "Profitez de réductions exclusives sur notre catalogue de sneakers.";
    const endDateFormatted = flashSale.endDate 
      ? new Date(flashSale.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Durée limitée';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef2f2; border-radius: 16px;">
        <div style="text-align: center; padding: 15px 0;">
          <h1 style="color: #991b1b; margin: 0; font-size: 28px; letter-spacing: 1px;">FOOTLOCKER<span style="color: #dc2626;">DZ</span></h1>
          <span style="display: inline-block; background-color: #dc2626; color: #ffffff; font-weight: bold; font-size: 12px; padding: 4px 12px; border-radius: 9999px; margin-top: 8px; text-transform: uppercase;">
            Offre Spéciale Abonnés
          </span>
        </div>

        <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.08); text-align: center;">
          <h2 style="color: #111827; font-size: 24px; margin-top: 0; font-weight: 800; text-transform: uppercase;">
            ${title}
          </h2>
          <div style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; font-size: 38px; font-weight: 900; padding: 10px 24px; border-radius: 12px; margin: 15px 0;">
            -${discount}%
          </div>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin: 10px 0 20px;">
            ${subtitle}
          </p>
          <div style="background-color: #fef2f2; border: 1px dashed #f87171; padding: 12px; border-radius: 8px; color: #b91c1c; font-size: 13px; font-weight: bold; margin-bottom: 25px;">
            ⏳ Offre valable jusqu'au ${endDateFormatted} dans la limite des stocks disponibles !
          </div>

          <a href="${frontendUrl}/sale" style="background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);">
            Découvrir les offres Vente Flash →
          </a>
        </div>

        <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
          Vous recevez ce message car vous êtes abonné à la newsletter FootLockerDZ.<br>
          100% Produits Originaux certifiés &bull; Livraison 58 Wilayas
        </div>
      </div>
    `;

    let successCount = 0;
    for (const sub of subscribers) {
      try {
        await sendEmail({
          email: sub.email,
          subject: `🔥 Vente Flash FootLockerDZ : Jusqu'à -${discount}% !`,
          html: emailHtml
        });
        successCount++;
      } catch (err) {
        console.error(`Erreur envoi vente flash à ${sub.email}:`, err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `La Vente Flash a été diffusée avec succès à ${successCount} abonné(s) !`,
      sentCount: successCount,
      totalSubscribers: subscribers.length
    });
  } catch (error) {
    console.error('Broadcast flash sale error:', error);
    res.status(500).json({ message: "Erreur lors de la diffusion de la vente flash." });
  }
};

// @desc    Broadcast a specific new product to all subscribers
// @route   POST /api/newsletter/broadcast-product/:id
// @access  Private/Admin
export const broadcastProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('brand');
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    const subscribers = await Newsletter.find({ active: true }).select('email');
    if (!subscribers || subscribers.length === 0) {
      return res.status(400).json({ message: "Aucun abonné inscrit à la newsletter pour le moment." });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const productName = product.name?.fr || product.name || 'Nouveau modèle';
    const brandName = product.brand?.name || 'FootLockerDZ';
    const mainImage = product.variants?.[0]?.images?.[0] || '';
    const formattedPrice = `${(product.discountPrice || product.price).toLocaleString('fr-FR')} DA`;
    const oldPriceHtml = product.discountPrice 
      ? `<span style="text-decoration: line-through; color: #9ca3af; font-size: 14px; margin-left: 8px;">${product.price.toLocaleString('fr-FR')} DA</span>` 
      : '';

    const productUrl = `${frontendUrl}/product/${product.sku}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6; border-radius: 16px;">
        <div style="text-align: center; padding: 15px 0;">
          <h1 style="color: #111827; margin: 0; font-size: 26px;">FOOTLOCKER<span style="color: #006233;">DZ</span></h1>
          <span style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 9999px; margin-top: 6px; text-transform: uppercase;">
            Nouveauté en rayon 👟
          </span>
        </div>

        <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.06); text-align: center;">
          ${mainImage ? `
            <div style="margin-bottom: 20px;">
              <img src="${mainImage.startsWith('http') ? mainImage : frontendUrl + mainImage}" alt="${productName}" style="max-width: 100%; height: auto; max-height: 280px; object-fit: contain; border-radius: 8px;" />
            </div>
          ` : ''}

          <div style="color: #6b7280; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
            ${brandName}
          </div>
          <h2 style="color: #111827; font-size: 22px; margin: 6px 0 12px; font-weight: 800;">
            ${productName}
          </h2>

          <div style="font-size: 24px; font-weight: 900; color: #006233; margin: 15px 0 25px;">
            ${formattedPrice} ${oldPriceHtml}
          </div>

          <a href="${productUrl}" style="background-color: #111827; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
            Découvrir ce modèle en détail →
          </a>
        </div>

        <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
          FootLockerDZ &bull; Produits 100% Originaux &bull; Paiement à la livraison
        </div>
      </div>
    `;

    let successCount = 0;
    for (const sub of subscribers) {
      try {
        await sendEmail({
          email: sub.email,
          subject: `✨ Nouveauté disponible chez FootLockerDZ : ${productName} !`,
          html: emailHtml
        });
        successCount++;
      } catch (err) {
        console.error(`Erreur envoi produit à ${sub.email}:`, err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `L'annonce de « ${productName} » a été envoyée avec succès à ${successCount} abonné(s) !`,
      sentCount: successCount,
      totalSubscribers: subscribers.length
    });
  } catch (error) {
    console.error('Broadcast product error:', error);
    res.status(500).json({ message: "Erreur lors de la diffusion de la nouveauté." });
  }
};
