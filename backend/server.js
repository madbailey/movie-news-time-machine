import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MovieService } from './services/movieService.js';
import { NewsService } from './services/newsService.js';
import { ContentMatcher } from './utils/contentMatcher.js';


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
        console.log('Fetching random movie...');
        const movie = await movieService.getRandom90sMovie();
        
        console.log('\nFetching news headlines...');
        const news = await newsService.getFrontPageHeadlines(movie.release_date, movie.overview);

        // Debug log the news articles
        console.log('\nNews articles found:', news.map(article => ({
            headline: article.headline,
            section: article.section,
            word_count: article.word_count
        })));

        res.json({
            movie: {
                title: movie.title,
                release_date: movie.release_date,
                overview: movie.overview,
                poster_path: movie.poster_path,
                popularity: movie.popularity,
                vote_average: movie.vote_average,
                vote_count: movie.vote_count
            },
            news: news.map(article => ({
                headline: article.headline,
                fullText: article.fullText,
                url: article.url,
                date: article.date,
                word_count: article.word_count,
                byline: article.byline,
                section: article.section,
                abstract: article.abstract
            }))
        });
    } catch (error) {
        console.error('Error in /api/random-pairing:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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