import nodemailer from 'nodemailer';

export const sendOtpEmail = async (to, otp, link) => {
  const transporter = nodemailer.createTransport({
    host: 'mail.webdevprahlad.site',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"VaultDrop" <no-reply@vaultdrop.com>',
    to,
    subject: 'Your OTP and File Access Link',
    text: `Your OTP is ${otp}. It expires in 10 minutes.\n\nAccess your file here: ${link}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #2c3e50;">🔐 VaultDrop Secure Access</h2>
        <p style="font-size: 16px; color: #333;">You have received a secure file access link.</p>
        
        <p style="font-size: 16px; margin-bottom: 10px;">
          <strong>Your OTP:</strong> 
          <span style="font-size: 20px; color: #e74c3c; letter-spacing: 2px;">${otp}</span>
        </p>

        <p style="color: #555; font-size: 14px;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
        
        <a href="${link}" style="display: inline-block; margin-top: 20px; background-color: #3498db; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
          Access File
        </a>

        <p style="margin-top: 30px; font-size: 12px; color: #888;">If you didn’t request this email, you can safely ignore it.</p>
      </div>
    `,
  });
};
