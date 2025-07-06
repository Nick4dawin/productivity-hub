const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by id
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to sync user data (e.g., preferences, settings)
const syncUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // If needed, refresh user data or sync preferences
    // For now, just pass to the next middleware
    next();
  } catch (error) {
    console.error('Sync user middleware error:', error);
    res.status(500).json({ message: 'Server error during user sync' });
  }
};

module.exports = { auth, syncUser };
