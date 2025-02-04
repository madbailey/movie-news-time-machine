import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MovieService } from './services/movieService.js';
import { NewsService } from './services/newsService.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const movieService = new MovieService(process.env.TMDB_API_KEY);
const newsService = new NewsService(process.env.NYT_API_KEY);

// Routes
app.get('/api/random-pairing', async (req, res) => {
    try {
        const movie = await movieService.getRandom90sMovie();
        const news = await newsService.getFrontPageHeadlines(movie.release_date);
        
        res.json({
            movie: {
                title: movie.title,
                release_date: movie.release_date,
                overview: movie.overview,
                poster_path: movie.poster_path
            },
            news
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});