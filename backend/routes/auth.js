import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import User from '../models/User.js';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// -------------------- REGISTER ROUTE --------------------
router.post('/register', async (req, res) => {
  try {
    console.log("📩 Incoming Register Request:", req.body);

    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ User already exists:", email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    console.log("🔑 Generating verification token...");
    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Save user
    console.log("💾 Saving user to DB...");
    const user = new User({ email, password: hashedPassword, verificationToken });
    await user.save();
    console.log("✅ User saved:", user._id);

    // Build verification link
    const verificationUrl = `http://${req.headers.host}/api/auth/verify-email/${verificationToken}`;

    console.log("📧 Sending verification email to:", email);
    const { data, error } = await resend.emails.send({
      from: 'VaultDrop <onboarding@resend.dev>', // can use verified domain later
      to: email,
      subject: 'VaultDrop Email Verification',
      html: `
        <h2>Email Verification</h2>
        <p>Thank you for registering with VaultDrop!</p>
        <p>Please click the following link to verify your email:</p>
        <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
      `,
    });

    if (error) {
      console.error("❌ Email send error:", error);
      return res.status(500).json({ message: 'Failed to send verification email', error });
    }

    console.log("✅ Email sent successfully:", data);
    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });

  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// -------------------- EMAIL VERIFICATION ROUTE --------------------
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const user = await User.findOne({ email: decoded.email, verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid verification token' });

    // Mark email as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Generate JWT for auto-login after verification
    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Redirect to frontend login page with token and message
    res.redirect(`/login?token=${authToken}&message=Email verified successfully. Please log in.`);
  } catch (error) {
    console.error("❌ Email Verification Error:", error);
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
});

// -------------------- LOGIN ROUTE --------------------
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
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// -------------------- FORGOT PASSWORD ROUTE --------------------
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Store reset token in user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;

    console.log("📧 Sending password reset email to:", email);
    const { data, error } = await resend.emails.send({
      from: 'VaultDrop <onboarding@resend.dev>',
      to: email,
      subject: 'VaultDrop Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>You are receiving this because you (or someone else) have requested to reset the password for your VaultDrop account.</p>
        <p>Please click the following link to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
    });

    if (error) {
      console.error("❌ Password reset email send error:", error);
      return res.status(500).json({ message: 'Failed to send password reset email', error });
    }

    console.log("✅ Password reset email sent:", data);
    res.json({ message: 'Password reset email sent' });

  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    res.status(500).json({ message: 'Error sending reset email', error: error.message });
  }
});

// -------------------- RESET PASSWORD ROUTE --------------------
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

export default router;
