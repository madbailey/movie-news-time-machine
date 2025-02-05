export class MovieService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.themoviedb.org/3';
    }

    async getRandom90sMovie() {
        try {
            // First get total pages of 90s movies with additional filters
            const initialResponse = await this.get90sMovies();
            const totalPages = Math.min(initialResponse.total_pages, 500); // TMDB caps at 500
            
            // Get random page
            const randomPage = Math.floor(Math.random() * totalPages) + 1;
            const movies = await this.get90sMovies(randomPage);
            
            // Get random movie from page, ensuring it has a release date
            const validMovies = movies.results.filter(movie => 
                movie.release_date && 
                movie.overview && 
                movie.vote_count > 100  // Ensure movie has significant votes
            );

            const randomIndex = Math.floor(Math.random() * validMovies.length);
            const selectedMovie = validMovies[randomIndex];

            // Fetch additional movie details
            const [castData, details] = await Promise.all([
                this.getMovieCredits(selectedMovie.id),
                this.getMovieDetails(selectedMovie.id)
            ]);

            // Combine all the data
            return {
                ...selectedMovie,
                cast: castData.cast.slice(0, 3),  // Top 3 cast members
                director: castData.crew.find(c => c.job === 'Director'),
                facts: [
                    details.budget > 0 && `Budget: $${details.budget.toLocaleString()}`,
                    details.revenue > 0 && `Box Office: $${details.revenue.toLocaleString()}`,
                    details.production_countries?.length > 0 && 
                        `Filmed in: ${details.production_countries.map(c => c.name).join(', ')}`,
                    details.tagline && `Tagline: "${details.tagline}"`,
                    details.runtime && `Runtime: ${details.runtime} minutes`
                ].filter(Boolean), // Remove any undefined/null values
                keywords: details.keywords?.keywords || [],
                genres: details.genres || []
            };

        } catch (error) {
            console.error('Error fetching movie data:', error);
            throw new Error(`Failed to fetch random movie: ${error.message}`);
        }
    }

    async get90sMovies(page = 1) {
        const url = new URL(`${this.baseUrl}/discover/movie`);
        const params = {
            api_key: this.apiKey,
            'primary_release_date.gte': '1990-01-01',
            'primary_release_date.lte': '1999-12-31',
            'vote_average.gte': '5',  // Minimum rating of 5
            'vote_count.gte': '100',  // At least 100 votes
            'with_original_language': 'en', // English language movies
            page: page.toString(),
            sort_by: 'popularity.desc'  // Sort by popularity
        };
        
        url.search = new URLSearchParams(params).toString();
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status}`);
        }
        
        return response.json();
    }

    async getMovieCredits(movieId) {
        const url = `${this.baseUrl}/movie/${movieId}/credits?api_key=${this.apiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status}`);
        }
        return response.json();
    }

    async getMovieDetails(movieId) {
        const url = `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&append_to_response=keywords`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status}`);
        }
        return response.json();
    }
}