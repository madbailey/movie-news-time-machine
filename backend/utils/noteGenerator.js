// utils/noteGenerator.js
export class NoteGenerator {
    static NOTE_TEMPLATES = {
        CONNECTION: [
            "Could this be connected? {theme} appears in both...",
            "Look closer at the {theme} angle",
            "Multiple sources confirm {theme}",
            "{word1} → {word2} ... coincidence?"
        ],
        TIMELINE: [
            "Timeline doesn't add up...",
            "Same day: {event1} and {event2}",
            "Why these dates?"
        ],
        QUESTION: [
            "Who benefits from {theme}?",
            "What aren't they telling us about {theme}?",
            "How deep does {theme} go?"
        ]
    };

    static NARRATIVE_CONNECTIONS = {
        POWER: {
            movieTerms: ['empire', 'control', 'leader', 'powerful'],
            newsTerms: ['government', 'authority', 'official', 'administration'],
            notes: ['Power structures at play?', 'Follow the chain of command']
        },
        CONSPIRACY: {
            movieTerms: ['secret', 'hidden', 'mystery', 'truth'],
            newsTerms: ['investigation', 'sources', 'revealed', 'classified'],
            notes: ['What are they hiding?', 'Connects to earlier findings']
        },
        CONFLICT: {
            movieTerms: ['fight', 'battle', 'war', 'enemy'],
            newsTerms: ['dispute', 'conflict', 'crisis', 'opposition'],
            notes: ['Multiple fronts?', 'Look for the pattern']
        }
    };

    static generateNotes(movieText, newsText, existingConnections) {
        const notes = [];
        
        // Generate thematic notes
        Object.entries(this.NARRATIVE_CONNECTIONS).forEach(([theme, {movieTerms, newsTerms, notes: themeNotes}]) => {
            const movieMatch = movieTerms.some(term => movieText.toLowerCase().includes(term));
            const newsMatch = newsTerms.some(term => newsText.toLowerCase().includes(term));
            
            console.log(`Theme: ${theme}, Movie Match: ${movieMatch}, News Match: ${newsMatch}`);
            
            if (movieMatch && newsMatch) {
                const noteContent = themeNotes[Math.floor(Math.random() * themeNotes.length)];
                console.log(`Generated Thematic Note: ${noteContent}`);
                notes.push({
                    type: 'thematic',
                    content: noteContent,
                    theme,
                    position: this.generateRandomPosition(),
                    style: this.generateNoteStyle()
                });
            }
        });

        // Generate connection notes with proper template substitution
        existingConnections.forEach(connection => {
            const template = this.NOTE_TEMPLATES.CONNECTION[
                Math.floor(Math.random() * this.NOTE_TEMPLATES.CONNECTION.length)
            ];
            
            // Extract theme and words from the connection
            const theme = connection.theme || connection.word || '';
            const word1 = connection.word || theme;
            const word2 = connection.word || theme;
            
            const noteContent = template
                .replace(/{theme}/g, theme)
                .replace(/{word1}/g, word1)
                .replace(/{word2}/g, word2);
            
            console.log(`Generated Connection Note: ${noteContent}`);
            
            notes.push({
                type: 'connection',
                content: noteContent,
                theme: theme,
                position: this.generateRandomPosition(),
                style: this.generateNoteStyle()
            });
        });

        const deduplicatedNotes = this.deduplicateNotes(notes);
        console.log('Deduplicated Notes:', deduplicatedNotes);
        return deduplicatedNotes;
    }

    static generateRandomPosition() {
        const position = {
            top: (20 + Math.random() * 60) + 'vh',
            left: (20 + Math.random() * 60) + 'vw',
            rotate: (-15 + Math.random() * 30) + 'deg'
        };
        console.log('Generated Position:', position);
        return position;
    }

    static generateNoteStyle() {
        const colors = ['yellow', 'blue', 'green', 'pink'];
        const randomIndex = Math.floor(Math.random() * colors.length);
        const randomHandwriting = Math.random() > 0.5;
        const style = {
            color: colors[randomIndex],
            handwriting: randomHandwriting ? 'messy' : 'neat'
        };
        console.log('Generated Style:', style);
        return style;
    }

    /**
     * Removes duplicate notes based on their content.
     * @param {Array} notes - The array of notes to deduplicate.
     * @returns {Array} - The deduplicated array of notes.
     */
    static deduplicateNotes(notes) {
        const seen = new Set();
        const deduplicated = notes.filter(note => {
            const lowercasedContent = note.content.toLowerCase();
            if (seen.has(lowercasedContent)) return false;
            seen.add(lowercasedContent);
            return true;
        });
        console.log('Deduplicated Notes:', deduplicated);
        return deduplicated;
    }
}