const Routine = require('../models/Routine');
const Todo = require('../models/Todo');
const Habit = require('../models/Habit');
const TimeBlock = require('../models/TimeBlock');

// @desc    Create a new routine
// @route   POST /api/routines
// @access  Private
const createRoutine = async (req, res) => {
  try {
    const { name, description, tasks, habits, timeBlocks, type, scheduleType, isActive } = req.body;

    const routine = new Routine({
      user: req.user._id,
      name,
      description,
      tasks,
      habits,
      timeBlocks,
      type,
      scheduleType: scheduleType || 'both',
      isActive: isActive !== undefined ? isActive : true,
    });

    const createdRoutine = await routine.save();
    
    // Populate the response
    const populatedRoutine = await Routine.findById(createdRoutine._id)
      .populate('tasks')
      .populate('habits')
      .populate('timeBlocks');
    
    res.status(201).json({
      success: true,
      data: populatedRoutine
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get all routines for a user
// @route   GET /api/routines
// @access  Private
const getRoutines = async (req, res) => {
  try {
    const { scheduleType, isActive } = req.query;
    
    const filter = { user: req.user._id };
    if (scheduleType && ['weekday', 'weekend', 'both'].includes(scheduleType)) {
      filter.scheduleType = scheduleType;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const routines = await Routine.find(filter)
      .populate('tasks')
      .populate('habits')
      .populate('timeBlocks')
      .sort({ createdAt: -1 });
      
    res.json({
      success: true,
      data: routines
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get a single routine by ID
// @route   GET /api/routines/:id
// @access  Private
const getRoutineById = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id)
      .populate('tasks')
      .populate('habits')
      .populate('timeBlocks');

    if (routine) {
        if (routine.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ 
              success: false,
              message: 'Not authorized' 
            });
        }
        res.json({
          success: true,
          data: routine
        });
    } else {
        res.status(404).json({ 
          success: false,
          message: 'Routine not found' 
        });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Update a routine
// @route   PUT /api/routines/:id
// @access  Private
const updateRoutine = async (req, res) => {
  try {
    const { name, description, tasks, habits, timeBlocks, type, scheduleType, isActive } = req.body;

    const routine = await Routine.findById(req.params.id);

    if (routine) {
        if (routine.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ 
              success: false,
              message: 'Not authorized' 
            });
        }

        routine.name = name || routine.name;
        routine.description = description || routine.description;
        routine.tasks = tasks || routine.tasks;
        routine.habits = habits || routine.habits;
        routine.timeBlocks = timeBlocks || routine.timeBlocks;
        routine.type = type || routine.type;
        routine.scheduleType = scheduleType || routine.scheduleType;
        if (isActive !== undefined) routine.isActive = isActive;

        const updatedRoutine = await routine.save();
        
        // Populate the response
        const populatedRoutine = await Routine.findById(updatedRoutine._id)
          .populate('tasks')
          .populate('habits')
          .populate('timeBlocks');
          
        res.json({
          success: true,
          data: populatedRoutine
        });
    } else {
        res.status(404).json({ 
          success: false,
          message: 'Routine not found' 
        });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
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
            return res.status(401).json({ 
              success: false,
              message: 'Not authorized' 
            });
        }

        // Also delete associated time blocks
        if (routine.timeBlocks && routine.timeBlocks.length > 0) {
          await TimeBlock.deleteMany({ _id: { $in: routine.timeBlocks } });
        }

        await routine.deleteOne();
        res.json({ 
          success: true,
          message: 'Routine and associated time blocks removed' 
        });
    } else {
        res.status(404).json({ 
          success: false,
          message: 'Routine not found' 
        });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

module.exports = {
  createRoutine,
  getRoutines,
  getRoutineById,
  updateRoutine,
  deleteRoutine,
};