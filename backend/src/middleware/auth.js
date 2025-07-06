const { ClerkExpressRequireAuth, clerkClient } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

const requireAuth = ClerkExpressRequireAuth();

const syncUser = async (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  try {
    const clerkId = req.auth.userId;
    let user = await User.findOne({ clerkId });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      if (!clerkUser) {
          return res.status(404).json({ message: 'Clerk user not found' });
      }

      const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId).emailAddress;
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();

      user = new User({
        clerkId,
        email,
        name: name || email,
      });
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error syncing user:', error);
    if (error.clerkError) {
        return res.status(500).json({ message: 'Error fetching user data from Clerk', error: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { auth: requireAuth, syncUser };
