import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

function createAccessToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' }); 
}

// register user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || ! password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (await User.findOne({username})) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({ username, passwordHash })
        await user.save();

        const token = createAccessToken(user._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000 
        });

        res.status(201).json({
            user: { id: user._id, username: user.username },
            message: 'Registration successful'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = createAccessToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({ user: { id: user._id, username: user.username }, message: 'Logged in' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// update account details
router.put('/update', verifyToken, async (req, res) => {
  const { newUsername, newPassword, password } = req.body;

  const user = await User.findById(req.user);
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

  if (newUsername) user.username = newUsername;
  if (newPassword) user.passwordHash = await bcrypt.hash(newPassword, 10);

  await user.save();
  res.json({ message: 'User updated' });
});

// logout
router.post('/logout', verifyToken, (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

export default router;