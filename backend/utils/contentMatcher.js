// utils/contentMatcher.js
export class ContentMatcher {
    // Enhanced thematic categories with weighted keywords and relationships
    static THEMES = {
        CONFLICT: {
            weight: 2.0,
            terms: ['war', 'fight', 'battle', 'conflict', 'struggle', 'dispute', 'controversy', 'tension', 'crisis'],
            related: ['POLITICS', 'DRAMA'],
            contexts: {
                personal: ['family', 'relationship', 'domestic'],
                social: ['protest', 'riot', 'revolution'],
                international: ['war', 'diplomatic', 'treaty']
            }
        },
        POLITICS: {
            weight: 1.8,
            terms: ['government', 'president', 'policy', 'election', 'political', 'leader', 'minister', 'campaign', 'vote'],
            related: ['SOCIAL', 'CHANGE'],
            contexts: {
                domestic: ['election', 'policy', 'reform'],
                foreign: ['diplomatic', 'international', 'treaty'],
                institutional: ['congress', 'parliament', 'senate']
            }
        },
        SOCIAL: {
            weight: 1.5,
            terms: ['community', 'public', 'society', 'people', 'social', 'cultural', 'nation', 'population', 'citizen'],
            related: ['CHANGE', 'FAMILY'],
            contexts: {
                urban: ['city', 'neighborhood', 'community'],
                cultural: ['tradition', 'heritage', 'identity'],
                economic: ['class', 'poverty', 'wealth']
            }
        },
        CONSPIRACY: {
            weight: 2.2,
            terms: ['secret', 'cover', 'hidden', 'truth', 'expose', 'reveal', 'investigation', 'mystery', 'conspiracy'],
            related: ['DRAMA', 'POLITICS'],
            contexts: {
                government: ['classified', 'agency', 'intelligence'],
                corporate: ['scandal', 'corruption', 'fraud'],
                personal: ['secret', 'betrayal', 'deception']
            }
        },
        TECHNOLOGY: {
            weight: 1.6,
            terms: ['computer', 'digital', 'internet', 'technology', 'innovation', 'scientific', 'research', 'discovery'],
            related: ['CHANGE', 'DRAMA'],
            contexts: {
                scientific: ['research', 'discovery', 'breakthrough'],
                social: ['impact', 'revolution', 'transformation'],
                economic: ['industry', 'market', 'business']
            }
        }
    };

    static getThematicScore(text, context = null) {
        const lowercaseText = text.toLowerCase();
        let totalScore = 0;
        const themeScores = {};

        Object.entries(this.THEMES).forEach(([category, themeData]) => {
            let categoryScore = 0;
            
            // Base term matching
            themeData.terms.forEach(term => {
                const regex = new RegExp(`\\b${term}\\w*\\b`, 'g');
                const matches = lowercaseText.match(regex) || [];
                categoryScore += matches.length * themeData.weight;
            });

            // Context-specific scoring
            if (context && themeData.contexts) {
                Object.entries(themeData.contexts).forEach(([contextType, contextTerms]) => {
                    if (context.includes(contextType)) {
                        contextTerms.forEach(term => {
                            const regex = new RegExp(`\\b${term}\\w*\\b`, 'g');
                            const matches = lowercaseText.match(regex) || [];
                            categoryScore += matches.length * (themeData.weight * 0.5);
                        });
                    }
                });
            }

            // Related themes bonus
            if (themeData.related) {
                themeData.related.forEach(relatedTheme => {
                    const relatedTerms = this.THEMES[relatedTheme]?.terms || [];
                    relatedTerms.forEach(term => {
                        const regex = new RegExp(`\\b${term}\\w*\\b`, 'g');
                        const matches = lowercaseText.match(regex) || [];
                        categoryScore += matches.length * (themeData.weight * 0.3);
                    });
                });
            }

            themeScores[category] = categoryScore;
            totalScore += categoryScore;
        });

        return {
            total: totalScore,
            themeScores,
            dominantTheme: Object.entries(themeScores)
                .sort(([,a], [,b]) => b - a)[0][0]
        };
    }

    static findCommonThemes(movieText, newsText) {
        const movieAnalysis = this.getThematicScore(movieText);
        const newsAnalysis = this.getThematicScore(newsText);
        let commonScore = 0;
        const commonThemes = [];

        Object.keys(this.THEMES).forEach(theme => {
            if (movieAnalysis.themeScores[theme] > 0 && newsAnalysis.themeScores[theme] > 0) {
                commonScore += Math.min(
                    movieAnalysis.themeScores[theme],
                    newsAnalysis.themeScores[theme]
                );
                commonThemes.push({
                    theme,
                    score: commonScore,
                    movieScore: movieAnalysis.themeScores[theme],
                    newsScore: newsAnalysis.themeScores[theme]
                });
            }
        });

        return {
            score: commonScore,
            themes: commonThemes.sort((a, b) => b.score - a.score),
            dominantTheme: commonThemes[0]?.theme
        };
    }
}