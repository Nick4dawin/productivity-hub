const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Movie', 'TV Show', 'Book', 'Game'],
    required: true,
  },
  genre: String,
  status: {
    type: String,
    enum: ['Completed', 'In Progress', 'Planned'],
    default: 'Planned',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: String,
  imageUrl: String,
  // For TV Shows
  episodesWatched: {
    type: Number,
    default: 0,
  },
  totalEpisodes: Number,
  // For Books
  pagesRead: {
    type: Number,
    default: 0,
  },
  totalPages: Number,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Media', mediaSchema); 