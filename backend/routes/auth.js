import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

function createAccessToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '10m' });
    //return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '10s' }); //testing
}

function createRenewToken(userId) {
    const now = Math.floor(Date.now() / 1000);
    
    const nbf = now + 9 * 60; // not active for 9 minutes
    //const nbf = now + 9 // testing

    return jwt.sign({ userId, nbf }, process.env.JWT_SECRET, { expiresIn: '1h'});
}

// register user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || ! password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (await User.findOne({username})) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if (await User.findOne({email})) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({ username, email, passwordHash })
        await user.save();

        const accessToken = createAccessToken(user._id);
        const renewToken = createRenewToken(user._id);

        res.status(201).json({
            accessToken,
            renewToken,
            user: { id: user._id, username: user.username, email: user.email }
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


        const accessToken = createAccessToken(user._id);
        const renewToken = createRenewToken(user._id);

        res.json({ accessToken, renewToken, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// renew tokens
router.post('/renew', async (req, res) => {
    try {
        const { renewToken } = req.body;

        if (!renewToken) {
            return res.status(400).json({ message: "No renew token provided" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;