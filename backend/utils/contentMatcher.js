// utils/contentMatcher.js
export class ContentMatcher {
    // Thematic categories with weighted keywords
    static THEMES = {
        CONFLICT: {
            weight: 2.0,
            terms: ['war', 'fight', 'battle', 'conflict', 'struggle', 'dispute', 'controversy', 'tension', 'crisis']
        },
        POLITICS: {
            weight: 1.8,
            terms: ['government', 'president', 'policy', 'election', 'political', 'leader', 'minister', 'campaign', 'vote']
        },
        SOCIAL: {
            weight: 1.5,
            terms: ['community', 'public', 'society', 'people', 'social', 'cultural', 'nation', 'population', 'citizen']
        },
        EMOTION: {
            weight: 1.7,
            terms: ['love', 'hate', 'fear', 'joy', 'anger', 'hope', 'dream', 'passion', 'desire']
        },
        DRAMA: {
            weight: 1.6,
            terms: ['scandal', 'tragedy', 'dramatic', 'shock', 'surprise', 'mystery', 'secret', 'revelation']
        },
        CHANGE: {
            weight: 1.4,
            terms: ['revolution', 'transformation', 'change', 'reform', 'movement', 'shift', 'transition']
        },
        FAMILY: {
            weight: 1.3,
            terms: ['family', 'parent', 'child', 'mother', 'father', 'brother', 'sister', 'marriage', 'relationship']
        }
    };

    static getThematicScore(text) {
        const lowercaseText = text.toLowerCase();
        let totalScore = 0;

        Object.entries(this.THEMES).forEach(([category, { weight, terms }]) => {
            terms.forEach(term => {
                const regex = new RegExp(`\\b${term}\\w*\\b`, 'g');
                const matches = lowercaseText.match(regex) || [];
                totalScore += matches.length * weight;
            });
        });

        return totalScore;
    }

    static findCommonThemes(movieText, newsText) {
        const movieThemes = new Set();
        const newsThemes = new Set();
        let commonScore = 0;

        // Collect themes for each text
        Object.entries(this.THEMES).forEach(([category, { weight, terms }]) => {
            terms.forEach(term => {
                if (movieText.toLowerCase().includes(term)) movieThemes.add(category);
                if (newsText.toLowerCase().includes(term)) newsThemes.add(category);
            });
        });

        // Score based on common themes
        movieThemes.forEach(theme => {
            if (newsThemes.has(theme)) {
                commonScore += this.THEMES[theme].weight;
            }
        });

        return commonScore;
    }
}