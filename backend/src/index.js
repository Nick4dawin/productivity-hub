require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const todoRoutes = require('./routes/todo.routes');
const habitRoutes = require('./routes/habit.routes');
const moodRoutes = require('./routes/mood.routes');
const journalRoutes = require('./routes/journal.routes');
const routineRoutes = require('./routes/routine.routes');
const goalRoutes = require('./routes/goal.routes');
const mediaRoutes = require('./routes/media.routes');
const financeRoutes = require('./routes/finance.routes');
const accountRoutes = require('./routes/account.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const budgetRoutes = require('./routes/budget.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const coachRoutes = require('./routes/coach.routes');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://productivity-hub.vercel.app',
    'https://productivity-hub-one.vercel.app',
    'https://productivity-hub-p1rc.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/coach', coachRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
