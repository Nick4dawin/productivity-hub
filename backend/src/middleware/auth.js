const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// All routes after this middleware will require authentication
module.exports = ClerkExpressRequireAuth();
