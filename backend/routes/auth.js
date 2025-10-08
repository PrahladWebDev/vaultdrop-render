import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import User from '../models/User.js';

const router = express.Router();

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to send emails
async function sendEmail({ to, subject, html }) {
  try {
    const response = await resend.emails.send({
      from: "VaultDrop <no-reply@webdevprahlad.site>", // Example: "VaultDrop <no-reply@yourdomain.com>"
      to,
      subject,
      html,
    });
    console.log('✅ Email sent:', response);
    return response;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw new Error('Failed to send email');
  }
}

// 📩 Register route
router.post('/register', async (req, res) => {
  try {
    console.log('📩 Incoming Register Request:', req.body);
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate verification token
    console.log('🔑 Generating verification token...');
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Save user
    console.log('💾 Saving user to DB...');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, verificationToken });
    await user.save();
    console.log('✅ User saved:', user._id);

    // Build verification email
    const verificationUrl = `http://${req.headers.host}/api/auth/verify-email/${verificationToken}`;
    const html = `
      <h2>VaultDrop Email Verification</h2>
      <p>Thank you for registering with <b>VaultDrop</b>!</p>
      <p>Please click the button below to verify your email:</p>
      <a href="${verificationUrl}" 
         style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; 
         border-radius: 5px; display: inline-block;">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
    `;

    console.log('📧 Sending verification email to:', email);
    await sendEmail({ to: email, subject: 'VaultDrop Email Verification', html });

    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    console.error('❌ Registration Error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// 📨 Email verification route
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const user = await User.findOne({ email: decoded.email, verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid verification token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Generate login token (optional auto-login)
    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.redirect(`/login?token=${authToken}&message=Email verified successfully. Please log in.`);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email' });
  }
});

// 🔐 Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// 🔄 Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your VaultDrop account.</p>
      <p>Click below to reset your password:</p>
      <a href="${resetUrl}" 
         style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; 
         border-radius: 5px; display: inline-block;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail({ to: email, subject: 'VaultDrop Password Reset', html });
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset email' });
  }
});

// 🔁 Reset password route
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password' });
  }
});

export default router;
