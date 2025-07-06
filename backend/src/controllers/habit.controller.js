const Habit = require('../models/Habit');

const formatHabitForClient = (habit) => {
  const habitObject = habit.toObject ? habit.toObject() : { ...habit };
  if (habitObject.completedDates) {
    habitObject.completedDates = habitObject.completedDates.map(date => new Date(date).toISOString().split('T')[0]);
  }
  return habitObject;
};

exports.getAllHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    console.log('[GET] Habits fetched:', habits.length);
    res.json(habits.map(formatHabitForClient));
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
    res.status(201).json(formatHabitForClient(habit));
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
    res.json(formatHabitForClient(habit));
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
    res.json(formatHabitForClient(habit));
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
    const sortedDates = [...new Set(habit.completedDates.map(d => d.toISOString().split('T')[0]))]
      .map(ds => new Date(ds))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    if (sortedDates.length > 0) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const mostRecent = sortedDates[0];
        const diff = (today.getTime() - mostRecent.getTime()) / (1000 * 3600 * 24);

        if (diff <= 1) { // Completed today or yesterday
            streak = 1;
            for (let i = 1; i < sortedDates.length; i++) {
                const d1 = sortedDates[i-1];
                const d2 = sortedDates[i];
                const dayDifference = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
                if (dayDifference === 1) {
                    streak++;
                } else {
                    break;
                }
            }
        }
    }

    habit.streak = streak;
    await habit.save();
    
    console.log('[TOGGLE] Habit updated:', habit._id, 'New streak:', streak);
    res.json(formatHabitForClient(habit));
  } catch (error) {
    console.error('[TOGGLE] Error updating habit:', error);
    res.status(500).json({ message: 'Error updating habit' });
  }
};
