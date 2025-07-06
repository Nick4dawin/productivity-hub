const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/user
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update user profile
// @route   PUT /api/user
// @access  Private
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update user avatar
// @route   PUT /api/user/avatar
// @access  Private
exports.updateAvatar = async (req, res) => {
  const { avatarUrl } = req.body;

  if (!avatarUrl) {
    return res.status(400).json({ msg: 'Avatar URL is required' });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.profilePicture = avatarUrl;
    await user.save();

    res.json({ profilePicture: user.profilePicture });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete user account
// @route   DELETE /api/user
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    // You might want to do more here, like invalidating tokens, cleaning up user data, etc.
    res.json({ msg: 'User account deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 