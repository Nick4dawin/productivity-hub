const User = require('../models/User');
const { Webhook } = require('svix');

const handleWebhook = async (req, res) => {
  const payload = req.body;
  const headers = req.headers;

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
  let msg;

  try {
    msg = wh.verify(payload, headers);
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({});
  }

  const { id, ...attributes } = msg.data;
  const eventType = msg.type;

  if (eventType === 'user.created') {
    const { email_addresses, primary_email_address_id, first_name, last_name } = attributes;
    const primaryEmail = email_addresses.find(email => email.id === primary_email_address_id);

    if (!primaryEmail) {
      return res.status(400).json({ message: 'Primary email not found for user' });
    }

    try {
      const newUser = new User({
        clerkId: id,
        email: primaryEmail.email_address,
        name: `${first_name || ''} ${last_name || ''}`.trim(),
      });
      await newUser.save();
      console.log('User created in DB:', newUser);
    } catch (error) {
      console.error('Error creating user in DB:', error);
      return res.status(500).json({ message: 'Error creating user' });
    }
  }

  if (eventType === 'user.updated') {
    try {
      const { email_addresses, primary_email_address_id, first_name, last_name } = attributes;
      const primaryEmail = email_addresses.find(email => email.id === primary_email_address_id);

      if (!primaryEmail) {
        return res.status(400).json({ message: 'Primary email not found for user' });
      }

      const updatedUser = await User.findOneAndUpdate(
        { clerkId: id },
        {
          email: primaryEmail.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim(),
        },
        { new: true }
      );
      console.log('User updated in DB:', updatedUser);
    } catch (error) {
      console.error('Error updating user in DB:', error);
      return res.status(500).json({ message: 'Error updating user' });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      if (id) {
        await User.findOneAndDelete({ clerkId: id });
        console.log('User deleted from DB:', id);
      } else {
        console.warn('Received user.deleted event with null id. Skipping.');
      }
    } catch (error) {
      console.error('Error deleting user from DB:', error);
      return res.status(500).json({ message: 'Error deleting user' });
    }
  }

  res.status(200).json({ success: true, message: 'Webhook received' });
};

module.exports = {
  handleWebhook,
}; 