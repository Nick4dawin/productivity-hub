const TimeBlock = require('../models/TimeBlock');
const Routine = require('../models/Routine');
const { validationResult } = require('express-validator');

// Get all time blocks for a user
const getTimeBlocks = async (req, res) => {
  try {
    const { scheduleType } = req.query;
    const userId = req.user.id;

    const filter = { user: userId };
    if (scheduleType && ['weekday', 'weekend'].includes(scheduleType)) {
      filter.scheduleType = scheduleType;
    }

    const timeBlocks = await TimeBlock.find(filter)
      .populate('routine', 'name type')
      .sort({ startTime: 1, position: 1 });

    res.json({
      success: true,
      data: timeBlocks
    });
  } catch (error) {
    console.error('Error fetching time blocks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time blocks',
      error: error.message
    });
  }
};

// Create a new time block
const createTimeBlock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const timeBlockData = {
      ...req.body,
      user: userId
    };

    // Check for time conflicts
    const conflictingBlock = await TimeBlock.findOne({
      user: userId,
      scheduleType: timeBlockData.scheduleType,
      $or: [
        {
          startTime: { $lt: timeBlockData.endTime },
          endTime: { $gt: timeBlockData.startTime }
        }
      ]
    });

    if (conflictingBlock) {
      return res.status(400).json({
        success: false,
        message: 'Time block conflicts with existing block'
      });
    }

    const timeBlock = new TimeBlock(timeBlockData);
    await timeBlock.save();

    // If routine is specified, add to routine
    if (timeBlockData.routine) {
      await Routine.findByIdAndUpdate(
        timeBlockData.routine,
        { $addToSet: { timeBlocks: timeBlock._id } }
      );
    }

    const populatedTimeBlock = await TimeBlock.findById(timeBlock._id)
      .populate('routine', 'name type');

    res.status(201).json({
      success: true,
      data: populatedTimeBlock
    });
  } catch (error) {
    console.error('Error creating time block:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create time block',
      error: error.message
    });
  }
};

// Update a time block
const updateTimeBlock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Find the time block
    const timeBlock = await TimeBlock.findOne({ _id: id, user: userId });
    if (!timeBlock) {
      return res.status(404).json({
        success: false,
        message: 'Time block not found'
      });
    }

    // Check for time conflicts (excluding current block)
    if (updateData.startTime || updateData.endTime) {
      const startTime = updateData.startTime || timeBlock.startTime;
      const endTime = updateData.endTime || timeBlock.endTime;
      const scheduleType = updateData.scheduleType || timeBlock.scheduleType;

      const conflictingBlock = await TimeBlock.findOne({
        _id: { $ne: id },
        user: userId,
        scheduleType: scheduleType,
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ]
      });

      if (conflictingBlock) {
        return res.status(400).json({
          success: false,
          message: 'Time block conflicts with existing block'
        });
      }
    }

    // Update the time block
    const updatedTimeBlock = await TimeBlock.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('routine', 'name type');

    res.json({
      success: true,
      data: updatedTimeBlock
    });
  } catch (error) {
    console.error('Error updating time block:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update time block',
      error: error.message
    });
  }
};

// Delete a time block
const deleteTimeBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const timeBlock = await TimeBlock.findOneAndDelete({ _id: id, user: userId });
    if (!timeBlock) {
      return res.status(404).json({
        success: false,
        message: 'Time block not found'
      });
    }

    // Remove from routine if associated
    if (timeBlock.routine) {
      await Routine.findByIdAndUpdate(
        timeBlock.routine,
        { $pull: { timeBlocks: timeBlock._id } }
      );
    }

    res.json({
      success: true,
      message: 'Time block deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting time block:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete time block',
      error: error.message
    });
  }
};

// Update time block position (for drag and drop)
const updateTimeBlockPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime } = req.body;
    const userId = req.user.id;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time and end time are required'
      });
    }

    // Find the time block
    const timeBlock = await TimeBlock.findOne({ _id: id, user: userId });
    if (!timeBlock) {
      return res.status(404).json({
        success: false,
        message: 'Time block not found'
      });
    }

    // Check for time conflicts (excluding current block)
    const conflictingBlock = await TimeBlock.findOne({
      _id: { $ne: id },
      user: userId,
      scheduleType: timeBlock.scheduleType,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingBlock) {
      return res.status(400).json({
        success: false,
        message: 'Time block conflicts with existing block'
      });
    }

    // Update the time block position
    const updatedTimeBlock = await TimeBlock.findByIdAndUpdate(
      id,
      { startTime, endTime },
      { new: true, runValidators: true }
    ).populate('routine', 'name type');

    res.json({
      success: true,
      data: updatedTimeBlock
    });
  } catch (error) {
    console.error('Error updating time block position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update time block position',
      error: error.message
    });
  }
};

// Get AI suggestions for empty time slots
const getAISuggestions = async (req, res) => {
  try {
    const { hour, scheduleType } = req.query;
    const userId = req.user.id;

    if (!hour || !scheduleType) {
      return res.status(400).json({
        success: false,
        message: 'Hour and schedule type are required'
      });
    }

    // Get user's existing time blocks for context
    const existingBlocks = await TimeBlock.find({
      user: userId,
      scheduleType: scheduleType
    }).sort({ startTime: 1 });

    // Get user's habits and goals for personalized suggestions
    // Temporarily disable to fix route error
    const userHabits = [];
    const userGoals = [];

    // Generate AI suggestions based on time of day and user context
    const suggestions = generateAISuggestions(parseInt(hour), scheduleType, existingBlocks, userHabits, userGoals);

    res.json({
      success: true,
      data: {
        suggestions,
        hour: parseInt(hour),
        scheduleType
      }
    });
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI suggestions',
      error: error.message
    });
  }
};

// Helper function to generate AI suggestions
function generateAISuggestions(hour, scheduleType, existingBlocks, habits, goals) {
  const suggestions = [];

  // Time-based suggestions
  if (hour >= 5 && hour < 8) {
    suggestions.push(
      'Start your day with meditation or stretching',
      'Review your daily goals and priorities',
      'Enjoy a healthy breakfast',
      'Do some light exercise or yoga'
    );
  } else if (hour >= 8 && hour < 12) {
    suggestions.push(
      'Focus on your most important task',
      'Schedule a team meeting or check-in',
      'Work on a challenging project',
      'Take a short break and hydrate'
    );
  } else if (hour >= 12 && hour < 14) {
    suggestions.push(
      'Take a proper lunch break',
      'Go for a walk outside',
      'Connect with a colleague or friend',
      'Practice mindful eating'
    );
  } else if (hour >= 14 && hour < 18) {
    suggestions.push(
      'Tackle administrative tasks',
      'Schedule follow-up meetings',
      'Work on creative projects',
      'Take a power nap if needed'
    );
  } else if (hour >= 18 && hour < 21) {
    suggestions.push(
      'Spend time with family or friends',
      'Prepare and enjoy dinner',
      'Engage in a hobby or personal interest',
      'Do some light exercise'
    );
  } else {
    suggestions.push(
      'Wind down with reading',
      'Practice gratitude journaling',
      'Prepare for tomorrow',
      'Relax with calming music or meditation'
    );
  }

  // Add habit-based suggestions
  if (habits && habits.length > 0) {
    const habitSuggestions = habits.slice(0, 2).map(habit => 
      `Work on your "${habit.name}" habit`
    );
    suggestions.push(...habitSuggestions);
  }

  // Add goal-based suggestions
  if (goals && goals.length > 0) {
    const goalSuggestions = goals.slice(0, 2).map(goal => 
      `Make progress on "${goal.title}"`
    );
    suggestions.push(...goalSuggestions);
  }

  // Return a random selection of 3-5 suggestions
  const shuffled = suggestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(5, suggestions.length));
}

module.exports = {
  getTimeBlocks,
  createTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  updateTimeBlockPosition,
  getAISuggestions
};