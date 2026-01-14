const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('Missing fields');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400);
        throw new Error('User already exists');
    }

    const avatarColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    const userName = name || email.split('@')[0];
    const now = new Date().toISOString();

    const newUser = await User.create({
        email,
        password: await bcrypt.hash(password, 10),
        name: userName,
        avatarColor,
        lastLogin: now
    });

    res.json({
        message: "success",
        user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            avatarColor: newUser.avatarColor,
            avatarUrl: newUser.avatarUrl,
            token: generateToken(newUser._id)
        }
    });
});

// @desc    Login user
// @route   POST /api/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    const now = new Date().toISOString();
    user.lastLogin = now;
    await user.save();

    res.json({
        message: "success",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarColor: user.avatarColor,
            avatarUrl: user.avatarUrl,
            token: generateToken(user._id)
        }
    });
});

// @desc    Logout user
// @route   POST /api/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        res.status(400);
        throw new Error('Missing userId');
    }

    const now = new Date().toISOString();
    await User.findByIdAndUpdate(userId, { lastLogout: now });

    res.json({ message: "success" });
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};
