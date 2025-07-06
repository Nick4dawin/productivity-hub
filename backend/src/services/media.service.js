const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const OPEN_LIBRARY_API_URL = 'https://openlibrary.org';

let twitchAccessToken = null;
let tmdbGenreMap = null;
let genrePromise = null;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getTmdbGenres = async () => {
    if (tmdbGenreMap) return tmdbGenreMap;
    if (genrePromise) return genrePromise;

    if (!TMDB_API_KEY) {
        console.error("TMDB_API_KEY is missing from .env file");
        throw new Error('TMDB API key is not configured.');
    }

    genrePromise = new Promise(async (resolve, reject) => {
        for (let i = 0; i < 3; i++) {
            try {
                const moviePromise = axios.get('https://api.themoviedb.org/3/genre/movie/list', { params: { api_key: TMDB_API_KEY } });
                const tvPromise = axios.get('https://api.themoviedb.org/3/genre/tv/list', { params: { api_key: TMDB_API_KEY } });

                const [movieResponse, tvResponse] = await Promise.all([moviePromise, tvPromise]);
                
                const genres = [...movieResponse.data.genres, ...tvResponse.data.genres];
                
                tmdbGenreMap = new Map(genres.map(g => [g.id, g.name]));
                console.log('Successfully fetched and cached TMDB genres.');
                resolve(tmdbGenreMap);
                return;
            } catch (error) {
                console.error(`Attempt ${i + 1} to fetch TMDB genres failed. Retrying...`);
                if (i === 2) {
                     console.error('Final attempt failed. Could not fetch TMDB genres.', error.message);
                     reject(new Error('Could not retrieve TMDB genres after multiple attempts.'));
                     return;
                }
                await new Promise(res => setTimeout(res, 1000));
            }
        }
    });

    try {
        return await genrePromise;
    } finally {
        genrePromise = null;
    }
};

const getTwitchAccessToken = async () => {
  if (twitchAccessToken) {
    return twitchAccessToken;
  }

  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    throw new Error('Twitch client ID or secret is not configured.');
  }

  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
      },
    });
    twitchAccessToken = response.data.access_token;
    // Token expires, setting a timeout to clear it before it does (expires_in is in seconds)
    setTimeout(() => {
        twitchAccessToken = null;
    }, (response.data.expires_in - 60) * 1000);
    return twitchAccessToken;
  } catch (error) {
    console.error('Failed to get Twitch access token:', error.response ? error.response.data : error.message);
    throw new Error('Could not retrieve Twitch access token.');
  }
};

const searchMovies = async (query) => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured.');
  }
  const genreMap = await getTmdbGenres();
  const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
    params: {
      api_key: TMDB_API_KEY,
      query: query,
    },
  });
  
  if (!response.data || !Array.isArray(response.data.results)) {
    console.error('TMDb API returned unexpected data for movies:', response.data);
    return [];
  }

  return response.data.results.map(movie => ({
    id: movie.id,
    title: movie.title,
    genre: movie.genre_ids.map(id => genreMap.get(id)).filter(Boolean).join(', '),
    rating: movie.vote_average ? (movie.vote_average / 2) : undefined,
    year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
    imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
  }));
};

const searchTvShows = async (query) => {
    if (!TMDB_API_KEY) {
        throw new Error('TMDB API key is not configured.');
    }
    const genreMap = await getTmdbGenres();
    const response = await axios.get(`https://api.themoviedb.org/3/search/tv`, {
        params: {
            api_key: TMDB_API_KEY,
            query: query,
        },
    });
    
    if (!response.data || !Array.isArray(response.data.results)) {
        console.error('TMDb API returned unexpected data for TV shows:', response.data);
        return [];
    }

    return response.data.results.map(show => ({
        id: show.id,
        title: show.name,
        genre: show.genre_ids.map(id => genreMap.get(id)).filter(Boolean).join(', '),
        rating: show.vote_average ? (show.vote_average / 2) : undefined,
        year: show.first_air_date ? show.first_air_date.substring(0, 4) : 'N/A',
        imageUrl: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : undefined,
    }));
};

const searchBooks = async (query) => {
  const response = await axios.get(`${OPEN_LIBRARY_API_URL}/search.json`, {
    params: {
      q: query,
    },
  });
  return response.data.docs.map(book => ({
    id: book.key,
    title: book.title,
    author: book.author_name ? book.author_name.join(', ') : 'N/A',
    genre: book.subject ? book.subject.slice(0, 3).join(', ') : 'N/A',
    year: book.first_publish_year || 'N/A',
    imageUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : undefined,
  }));
};

const searchGames = async (query) => {
    try {
        const accessToken = await getTwitchAccessToken();
        const response = await axios.post(
            'https://api.igdb.com/v4/games',
            `fields name, genres.name, cover.url, summary, first_release_date, rating; search "${query}"; limit 20;`,
            {
                headers: {
                    'Client-ID': TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                },
            }
        );

        return response.data.map(game => ({
            id: game.id,
            title: game.name,
            genre: game.genres ? game.genres.map(g => g.name).join(', ') : 'N/A',
            rating: game.rating ? (game.rating / 20) : undefined, // IGDB is 0-100, convert to 0-5
            year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear().toString() : 'N/A',
            imageUrl: game.cover ? game.cover.url.replace('t_thumb', 't_cover_big') : undefined,
        }));
    } catch (error) {
        console.error('Failed to search games on IGDB:', error.response ? error.response.data : error.message);
        throw new Error('Failed to search games.');
    }
};

module.exports = {
  searchMovies,
  searchTvShows,
  searchBooks,
  searchGames,
}; 