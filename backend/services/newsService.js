// services/newsService.js
export class NewsService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.nytimes.com/svc/archive/v1';
    }

    async getFrontPageHeadlines(dateStr) {
        try {
            // Parse the date string (format: YYYY-MM-DD)
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // getMonth() returns 0-11
            
            // Construct URL with year and month
            const url = `${this.baseUrl}/${year}/${month}.json?api-key=${this.apiKey}`;
            
            console.log(`Fetching NYT archives for ${year}/${month}`);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`NYT API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Filter for front page articles from the specific date
            // Format date for comparison (YYYY-MM-DD)
            const targetDate = dateStr.split('T')[0];
            
            const frontPageArticles = data.response.docs
                .filter(doc => {
                    const pubDate = doc.pub_date.split('T')[0];
                    return (
                        pubDate === targetDate &&
                        doc.print_page === "1" &&
                        doc.document_type === "article"
                    );
                })
                .map(doc => ({
                    headline: doc.headline.main,
                    abstract: doc.abstract || doc.snippet || doc.lead_paragraph,
                    url: doc.web_url,
                    date: doc.pub_date,
                    type: doc.document_type,
                    section: doc.section_name
                }))
                .slice(0, 5); // Limit to top 5 articles

            if (frontPageArticles.length === 0) {
                console.log(`No front page articles found for date: ${targetDate}`);
            }

            return frontPageArticles;
        } catch (error) {
            console.error('NewsService error:', error);
            throw new Error(`Failed to fetch headlines: ${error.message}`);
        }
    }
}