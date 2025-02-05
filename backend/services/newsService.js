import { ContentMatcher } from '../utils/contentMatcher.js';

export class NewsService {
    EXCLUDED_SECTIONS = new Set([
        'Sports',
        'Books',
        'Bridge',
        'Chess',
        'Real Estate',
        'Classified',
        'Automobiles',
        'Corrections',
        'Style',
        'Fashion',
        'Food',
        'Dining',
        'Travel',
        'Weather'
    ]);
    EXCLUDED_KEYWORDS = [

    ];
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.nytimes.com/svc/archive/v1';
    }

    shouldIncludeArticle(doc) {
        // Check section
        if (this.EXCLUDED_SECTIONS.has(doc.section_name)) {
            return false;
        }

        const fullText = `${doc.headline.main} ${doc.abstract || ''} ${doc.lead_paragraph || ''}`.toLowerCase();

        // Check for excluded keywords
        if (this.EXCLUDED_KEYWORDS.some(keyword => fullText.includes(keyword))) {
            return false;
        }

        // Ensure article has substantial content
        if (!doc.lead_paragraph || doc.word_count < 200) {
            return false;
        }

        // Prefer articles with substance
        const hasSubstance = /conflict|crisis|change|impact|discover|reveal|challenge|struggle|transform/i.test(fullText);
        
        return hasSubstance;
    }

    async getFrontPageHeadlines(dateStr, movieOverview) {
        try {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            
            const response = await fetch(
                `${this.baseUrl}/${year}/${month}.json?api-key=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error(`NYT API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Get articles from a 5-day window
            const targetDate = new Date(dateStr);
            const dateRange = [-2, -1, 0, 1, 2];
            const articlesInRange = data.response.docs
                .filter(doc => {
                    const pubDate = new Date(doc.pub_date);
                    const dayDiff = Math.floor((pubDate - targetDate) / (1000 * 60 * 60 * 24));
                    return dateRange.includes(dayDiff) && this.shouldIncludeArticle(doc);
                });

            // Remove duplicates
            const uniqueArticles = Array.from(
                new Map(articlesInRange.map(article => [article.headline.main, article])).values()
            );

            // Score and sort articles
            const scoredArticles = uniqueArticles.map(doc => {
                const fullText = this.combineArticleText(doc);
                const thematicScore = this.calculateThematicScore(fullText, movieOverview);
                const dayDiff = Math.abs(new Date(doc.pub_date).getDate() - date.getDate());

                return {
                    headline: doc.headline.main,
                    fullText,
                    url: doc.web_url,
                    date: doc.pub_date,
                    word_count: doc.word_count || 0,
                    byline: doc.byline?.original || '',
                    section: doc.section_name || '',
                    abstract: doc.abstract,
                    score: this.calculateArticleScore({
                        wordCount: doc.word_count || 0,
                        isFrontPage: doc.print_page === "1",
                        thematicScore,
                        dayDiff,
                        isWorldNews: doc.section_name === 'World',
                        isNationalNews: doc.section_name === 'National'
                    })
                };
            });

            // Get top 5 unique articles by score
            const selectedArticles = scoredArticles
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);

            console.log('Selected articles:', selectedArticles.map(a => ({
                headline: a.headline,
                section: a.section,
                score: a.score.toFixed(2)
            })));

            return selectedArticles;

        } catch (error) {
            console.error('NewsService error:', error);
            throw new Error(`Failed to fetch headlines: ${error.message}`);
        }
    }

    calculateArticleScore({ wordCount, isFrontPage, thematicScore, dayDiff, isWorldNews, isNationalNews }) {
        return (
            (wordCount / 200) + // Length factor
            (isFrontPage ? 50 : 0) + // Front page bonus
            (thematicScore * 10) + // Thematic relevance
            (2 - dayDiff) * 10 + // Date proximity
            (isWorldNews ? 20 : 0) + // Bonus for world news
            (isNationalNews ? 15 : 0) // Bonus for national news
        );
    }

    calculateThematicScore(articleText, movieOverview) {
        if (!articleText || !movieOverview) return 0;
        
        const movieWords = new Set(
            movieOverview.toLowerCase()
                .split(/\W+/)
                .filter(word => word.length > 3)
        );

        const articleWords = articleText.toLowerCase()
            .split(/\W+/)
            .filter(word => word.length > 3);

        let score = 0;
        articleWords.forEach(word => {
            if (movieWords.has(word)) {
                score += 1;
            }
        });

        return score;
    }

    combineArticleText(doc) {
        const texts = new Set();
        if (doc.abstract) texts.add(doc.abstract);
        if (doc.lead_paragraph && doc.lead_paragraph !== doc.abstract) {
            texts.add(doc.lead_paragraph);
        }
        if (doc.snippet && !texts.has(doc.snippet)) {
            texts.add(doc.snippet);
        }
        return Array.from(texts).join(' ');
    }
}