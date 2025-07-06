const Routine = require('../models/Routine');
const Todo = require('../models/Todo');
const Habit = require('../models/Habit');

// @desc    Create a new routine
// @route   POST /api/routines
// @access  Private
const createRoutine = async (req, res) => {
  try {
    const { name, description, tasks, habits, type } = req.body;

    const routine = new Routine({
      user: req.user._id,
      name,
      description,
      tasks,
      habits,
      type,
    });

    const createdRoutine = await routine.save();
    res.status(201).json(createdRoutine);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all routines for a user
// @route   GET /api/routines
// @access  Private
const getRoutines = async (req, res) => {
  try {
    const routines = await Routine.find({ user: req.user._id }).populate('tasks').populate('habits');
    res.json(routines);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get a single routine by ID
// @route   GET /api/routines/:id
// @access  Private
const getRoutineById = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id).populate('tasks').populate('habits');

    if (routine) {
        if (routine.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
      res.json(routine);
    } else {
      res.status(404).json({ message: 'Routine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a routine
// @route   PUT /api/routines/:id
// @access  Private
const updateRoutine = async (req, res) => {
  try {
    const { name, description, tasks, habits, type } = req.body;
    const routine = await Routine.findById(req.params.id);

    if (routine) {
      if (routine.user.toString() !== req.user._id.toString()) {
          return res.status(401).json({ message: 'Not authorized' });
      }

      routine.name = name || routine.name;
      routine.description = description || routine.description;
      routine.tasks = tasks || routine.tasks;
      routine.habits = habits || routine.habits;
      routine.type = type || routine.type;

      const updatedRoutine = await routine.save();
      res.json(updatedRoutine);
    } else {
      res.status(404).json({ message: 'Routine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a routine
// @route   DELETE /api/routines/:id
// @access  Private
const deleteRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (routine) {
      if (routine.user.toString() !== req.user._id.toString()) {
          return res.status(401).json({ message: 'Not authorized' });
      }
      
      await routine.deleteOne();
      res.json({ message: 'Routine removed' });
    } else {
      res.status(404).json({ message: 'Routine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createRoutine,
  getRoutines,
  getRoutineById,
  updateRoutine,
  deleteRoutine,
}; 