const Media = require('../models/Media');
const mediaService = require('../services/media.service');

// @desc    Get all media for a user
// @route   GET /api/media
// @access  Private
const getAllMedia = async (req, res) => {
  try {
    const media = await Media.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a media entry
// @route   POST /api/media
// @access  Private
const createMedia = async (req, res) => {
  try {
    const newMedia = new Media({
      ...req.body,
      user: req.user._id,
    });
    const savedMedia = await newMedia.save();
    res.status(201).json(savedMedia);
  } catch (error) {
    res.status(400).json({ message: 'Error creating media entry', error: error.message });
  }
};

// @desc    Get a single media entry by ID
// @route   GET /api/media/:id
// @access  Private
const getMediaById = async (req, res) => {
  try {
    const media = await Media.findOne({ _id: req.params.id, user: req.user._id });
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a media entry
// @route   PUT /api/media/:id
// @access  Private
const updateMedia = async (req, res) => {
  try {
    const media = await Media.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    res.json(media);
  } catch (error) {
    res.status(400).json({ message: 'Error updating media entry', error: error.message });
  }
};

// @desc    Delete a media entry
// @route   DELETE /api/media/:id
// @access  Private
const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    res.json({ message: 'Media entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const searchExternalMedia = async (req, res) => {
    const { type, query } = req.query;

    if (!type || !query) {
        return res.status(400).json({ message: 'Type and query are required' });
    }

    try {
        let results;
        if (type === 'Movie') {
            results = await mediaService.searchMovies(query);
        } else if (type === 'TV Show') {
            results = await mediaService.searchTvShows(query);
        } else if (type === 'Book') {
            results = await mediaService.searchBooks(query);
        } else if (type === 'Game') {
            results = await mediaService.searchGames(query);
        } else {
            return res.status(400).json({ message: 'Invalid media type' });
        }
        res.json(results);
    } catch (error) {
        console.error('Error searching external media:', error);
        res.status(500).json({ message: 'Failed to search external media', error: error.message });
    }
};

module.exports = {
  getAllMedia,
  createMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  searchExternalMedia,
}; 