// services/movieService.js
export class MovieService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.themoviedb.org/3';
    }

    async getRandom90sMovie() {
        try {
            // First get total pages of 90s movies
            const initialResponse = await this.get90sMovies();
            const totalPages = Math.min(initialResponse.total_pages, 500); // TMDB caps at 500
            
            // Get random page
            const randomPage = Math.floor(Math.random() * totalPages) + 1;
            const movies = await this.get90sMovies(randomPage);
            
            // Get random movie from page
            const randomIndex = Math.floor(Math.random() * movies.results.length);
            return movies.results[randomIndex];
        } catch (error) {
            throw new Error(`Failed to fetch random movie: ${error.message}`);
        }
    }

    async get90sMovies(page = 1) {
        const url = new URL(`${this.baseUrl}/discover/movie`);
        const params = {
            api_key: this.apiKey,
            'primary_release_date.gte': '1990-01-01',
            'primary_release_date.lte': '1999-12-31',
            page: page.toString(),
            sort_by: 'primary_release_date.asc'
        };
        
        url.search = new URLSearchParams(params).toString();
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status}`);
        }
        
        return response.json();
    }
}