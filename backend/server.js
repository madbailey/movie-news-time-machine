import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MovieService } from './services/movieService.js';
import { NewsService } from './services/newsService.js';
import { NoteGenerator } from './utils/noteGenerator.js';
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

// Helper function to analyze content connections
const analyzeContentConnections = (movie, newsArticles) => {
    // Get movie text content including cast info
    const movieText = `${movie.title} ${movie.overview} ${
        movie.cast?.map(actor => `${actor.name} ${actor.character}`).join(' ') || ''
    }`.toLowerCase();
    
    // Analyze each news article
    const articleAnalysis = newsArticles.map(article => {
        const articleText = `${article.headline} ${article.fullText}`.toLowerCase();
        
        // Find thematic connections
        const thematicScore = ContentMatcher.getThematicScore(articleText);
        const commonThemes = ContentMatcher.findCommonThemes(movieText, articleText);
        
        return {
            ...article,
            analysis: {
                thematicScore,
                commonThemes
            }
        };
    });

    // Generate notes based on connections and facts
    const notes = NoteGenerator.generateNotes(
        movieText,
        newsArticles.map(a => a.fullText).join(' '),
        articleAnalysis.flatMap(a => a.analysis.commonThemes)
    );
    console.log("Generated Notes:", notes);

    return {
        articles: articleAnalysis,
        notes,
        overallThemes: ContentMatcher.THEMES
    };
};

// Routes
app.get('/api/random-pairing', async (req, res) => {
    try {
        console.log('Fetching random movie...');
        const movie = await movieService.getRandom90sMovie();
        
        console.log('\nFetching news headlines...');
        const news = await newsService.getFrontPageHeadlines(movie.release_date, movie.overview);

        // Analyze connections and generate notes
        const contentAnalysis = analyzeContentConnections(movie, news);

        // Debug log
        console.log('\nContent analysis:', {
            articleCount: contentAnalysis.articles.length,
            noteCount: contentAnalysis.notes.length,
            themes: Object.keys(contentAnalysis.overallThemes),
            castCount: movie.cast?.length || 0
        });

        res.json({
            movie: {
                // Basic movie info only
                title: movie.title,
                release_date: movie.release_date,
                overview: movie.overview,
                poster_path: movie.poster_path,
                
                // Keep cast for thematic analysis
                cast: movie.cast || [],
                director: movie.director || null,
                
                // Remove trivia/facts
                genres: movie.genres || []
            },
            news: contentAnalysis.articles.map(article => ({
                headline: article.headline,
                fullText: article.fullText,
                url: article.url,
                date: article.date,
                word_count: article.word_count,
                byline: article.byline,
                section: article.section,
                abstract: article.abstract,
                thematicScore: article.analysis.thematicScore,
                commonThemes: article.analysis.commonThemes
            })),
            analysis: {
                notes: contentAnalysis.notes,
                themes: contentAnalysis.overallThemes
            }
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