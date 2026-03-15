const nodemailer = require('nodemailer');

let transporter;
if (process.env.EMAIL_SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: process.env.EMAIL_SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_SMTP_USER,
      pass: process.env.EMAIL_SMTP_PASS
    }
  });
} else {
  transporter = nodemailer.createTransport({ jsonTransport: true });
}

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) return;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@familymart.local',
    to,
    subject,
    text,
    html
  });
};

module.exports = { sendEmail };
