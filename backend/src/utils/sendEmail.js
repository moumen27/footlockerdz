import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Option 1: Brevo HTTPS API (Recommandé pour Render car Render bloque les ports SMTP 587/465)
  if (process.env.BREVO_API_KEY) {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: process.env.FROM_NAME || 'FootLockerDZ',
          email: process.env.FROM_EMAIL || process.env.SMTP_USER,
        },
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent: options.html || options.message,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Brevo API Error: ${errText}`);
    }
    return;
  }

  // Option 2: SMTP standard (Gmail / Nodemailer)
  let transporter;

  if (process.env.SMTP_USER && process.env.SMTP_USER !== 'votre.email@gmail.com') {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: port,
      secure: port === 465, // true pour port 465, false pour 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
    });
  } else {
    // Mode test local (Ethereal)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const message = {
    from: `${process.env.FROM_NAME || 'FootLockerDZ'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  if (process.env.NODE_ENV === 'development') {
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

export default sendEmail;

