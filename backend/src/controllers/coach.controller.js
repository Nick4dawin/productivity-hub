const { getCoachSummary } = require('../services/ai.service');

// @desc    Get AI coach summary
// @route   POST /api/coach/summary
// @access  Private
const getSummary = async (req, res) => {
    try {
        const summary = await getCoachSummary(req.body);
        res.json({ summary });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getSummary,
}; 