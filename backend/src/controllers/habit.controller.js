const Habit = require('../models/Habit');

exports.getAllHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    console.log('[GET] Habits fetched:', habits.length);
    res.json(habits);
  } catch (error) {
    console.error('[GET] Error fetching habits:', error);
    res.status(500).json({ message: 'Error fetching habits' });
  }
};

exports.createHabit = async (req, res) => {
  try {
    const habit = new Habit({
      ...req.body,
      userId: req.user._id
    });
    await habit.save();
    console.log('[POST] Habit created:', habit);
    res.status(201).json(habit);
  } catch (error) {
    console.error('[POST] Error creating habit:', error);
    res.status(500).json({ message: 'Error creating habit' });
  }
};

exports.getHabitById = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!habit) {
      console.log('[GET] Habit not found:', req.params.id);
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    console.log('[GET] Habit fetched by id:', habit._id);
    res.json(habit);
  } catch (error) {
    console.error('[GET] Error fetching habit:', error);
    res.status(500).json({ message: 'Error fetching habit' });
  }
};

exports.updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!habit) {
      console.log('[PUT] Habit not found:', req.params.id);
      return res.status(404).json({ message: 'Habit not found' });
    }

    console.log('[PUT] Habit updated:', habit._id);
    res.json(habit);
  } catch (error) {
    console.error('[PUT] Error updating habit:', error);
    res.status(500).json({ message: 'Error updating habit' });
  }
};

exports.deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!habit) {
      console.log('[DELETE] Habit not found:', req.params.id);
      return res.status(404).json({ message: 'Habit not found' });
    }

    console.log('[DELETE] Habit deleted:', habit._id);
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('[DELETE] Error deleting habit:', error);
    res.status(500).json({ message: 'Error deleting habit' });
  }
};

exports.toggleHabitDate = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!habit) {
      console.log('[TOGGLE] Habit not found:', req.params.id);
      return res.status(404).json({ message: 'Habit not found' });
    }

    const date = new Date(req.params.date);
    const dateString = date.toISOString().split('T')[0];

    const dateIndex = habit.completedDates.findIndex(d => 
      d.toISOString().split('T')[0] === dateString
    );

    if (dateIndex === -1) {
      habit.completedDates.push(date);
      console.log('[TOGGLE] Date added:', dateString);
    } else {
      habit.completedDates.splice(dateIndex, 1);
      console.log('[TOGGLE] Date removed:', dateString);
    }

    // Calculate streak
    const today = new Date();
    const sortedDates = [...habit.completedDates].sort((a, b) => b - a);
    let streak = 0;
    let currentDate = today;

    for (const date of sortedDates) {
      const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        streak++;
        currentDate = date;
      } else {
        break;
      }
    }

    habit.streak = streak;
    await habit.save();
    
    console.log('[TOGGLE] Habit updated:', habit._id, 'New streak:', streak);
    res.json(habit);
  } catch (error) {
    console.error('[TOGGLE] Error updating habit:', error);
    res.status(500).json({ message: 'Error updating habit' });
  }
};
