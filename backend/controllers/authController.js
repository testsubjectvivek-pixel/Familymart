const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES_SECONDS = parseInt(process.env.JWT_REFRESH_EXPIRES || '604800', 10); // 7d default

const signAccessToken = (id, role) => jwt.sign(
  { id, role },
  process.env.JWT_ACCESS_SECRET,
  {
    expiresIn: ACCESS_EXPIRES,
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE
  }
);

const generateRefreshToken = () => crypto.randomBytes(40).toString('hex');

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_EXPIRES_SECONDS * 1000,
    path: '/api/auth/refresh'
  });
};

// @desc    Register user (or admin)
// @route   POST /api/auth/register
// @access  Public (for initial admin setup)
const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      role: 'user'
    });

    const refreshToken = generateRefreshToken();
    await user.setRefreshToken(refreshToken, new Date(Date.now() + REFRESH_EXPIRES_SECONDS * 1000));
    await user.save();

    const accessToken = signAccessToken(user._id, user.role);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: accessToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const refreshToken = generateRefreshToken();
    await user.setRefreshToken(refreshToken, new Date(Date.now() + REFRESH_EXPIRES_SECONDS * 1000));
    await user.save();

    const accessToken = signAccessToken(user._id, user.role);
    setRefreshCookie(res, refreshToken);

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: accessToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    // Search only users with non-expired refresh tokens to limit scan
    const candidates = await User.find({ refreshTokenExpires: { $gt: new Date() } });
    let matchedUser = null;
    for (const u of candidates) {
      if (await u.verifyRefreshToken(token)) {
        matchedUser = u;
        break;
      }
    }
    if (!matchedUser) return res.status(401).json({ message: 'Invalid refresh token' });

    const newAccess = signAccessToken(matchedUser._id, matchedUser.role);
    const newRefresh = generateRefreshToken();
    await matchedUser.setRefreshToken(newRefresh, new Date(Date.now() + REFRESH_EXPIRES_SECONDS * 1000));
    await matchedUser.save();
    setRefreshCookie(res, newRefresh);

    res.json({ token: newAccess });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const users = await User.find({ refreshTokenExpires: { $gt: new Date() } });
      for (const u of users) {
        if (await u.verifyRefreshToken(token)) {
          u.refreshToken = undefined;
          u.refreshTokenExpires = undefined;
          await u.save();
          break;
        }
      }
    }
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    res.json({ message: 'Logged out' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  refreshToken,
  logout
};
