import React, { useState, useEffect } from 'react';
import StickyNote from './StickyNote';
import MovieCard from './MovieCard';
import NewsClipping from './NewsClipping';
import ConnectionLines from './ConnectionLines';
import PhotoClipping from './PhotoClipping';
import FactCard from './FactCard';
import AmbientBackground from './AmbientBackground';
import { POSITIONS, getRandomPosition } from './utils';

export default function MovieNewsPairing() {
    const [pairing, setPairing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [wordPositions, setWordPositions] = useState({});
    const [connections, setConnections] = useState([]);
    const [initialized, setInitialized] = useState(false);
    const [connectedWords, setConnectedWords] = useState([]);
    const [notes, setNotes] = useState([]);  // Add notes state

    const fetchRandomPairing = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3000/api/random-pairing');
        const data = await response.json();
        setPairing(data);
        
        // Set notes if they exist in the response
        if (data.analysis?.notes) {
            setNotes(data.analysis.notes);
        }
        
        // Reset states
        setWordPositions({});
        setConnections([]);
        setConnectedWords([]);
      } catch (err) {
        setError('Failed to fetch pairing. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const handleWordPosition = (word, index, source, position) => {
        const sourceType = source.startsWith('movie-') ? 'movie' : 'newspaper';
        
        setWordPositions(prev => ({
          ...prev,
          [`${word}-${index}-${source}`]: {
            word,
            position,
            source,
            sourceType
          }
        }));
    };

    useEffect(() => {
        const newConnections = [];
        const words = {};
        const newConnectedWords = [];

        Object.values(wordPositions).forEach(({ word, position, source, sourceType }) => {
            if (!words[word]) words[word] = [];
            words[word].push({ position, source, sourceType });
        });

        Object.entries(words).forEach(([word, positions]) => {
            if (positions.length > 1) {
                const moviePositions = positions.filter(p => p.sourceType === 'movie');
                const newspaperPositions = positions.filter(p => p.sourceType === 'newspaper');

                moviePositions.forEach(moviePos => {
                    newspaperPositions.forEach(newsPos => {
                        newConnections.push({
                            start: moviePos.position,
                            end: newsPos.position,
                            word
                        });

                        newConnectedWords.push({
                            word,
                            movieSource: moviePos.source,
                            newsSource: newsPos.source
                        });
                    });
                });
            }
        });

        setConnections(newConnections);
        setConnectedWords(newConnectedWords);
    }, [wordPositions]);

    useEffect(() => {
      if (!initialized) {
        fetchRandomPairing();
        setInitialized(true);
      }
    }, [initialized]);

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-zinc-900">
            {/* Background elements with proper z-indexing */}
            <AmbientBackground />
            
            {/* Main content with higher z-index */}
            <div className="relative z-10">
                {/* Header */}
                <div className="h-[10vh] flex flex-col items-center justify-center">
                    <h1 className="text-4xl font-playfair font-bold text-white mb-2">Cut</h1>
                    <button
                        onClick={fetchRandomPairing}
                        disabled={loading}
                        className="bg-neutral-100 text-black px-6 py-2 rounded shadow-lg hover:bg-white transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Investigating...' : 'Search deeper'}
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="text-red-200 text-center bg-red-900/20 p-2 rounded mx-auto max-w-md">
                        {error}
                    </div>
                )}

                {/* Content area */}
                {!loading && pairing && (
                    <div className="relative h-[90vh]">
                        <ConnectionLines connections={connections} />
                        
                        <MovieCard
                            movie={pairing.movie}
                            onWordPosition={handleWordPosition}
                            connections={connectedWords}
                        />
                        
                        {pairing.news?.map((article, index) => (
                            <NewsClipping
                                key={index}
                                article={article}
                                position={{
                                    ...POSITIONS[index],
                                    rotate: `${-2 + Math.random() * 4}deg`
                                }}
                                date={new Date(pairing.movie.release_date).toLocaleDateString()}
                                onWordPosition={handleWordPosition}
                                connections={connectedWords}
                            />
                        ))}

                        {pairing.movie.cast?.map((actor, index) => {
                            const position = getRandomPosition(index);
                            
                            return (
                                <PhotoClipping
                                    key={`cast-${index}`}
                                    imageUrl={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                    caption={`${actor.name} as "${actor.character}"`}
                                    position={position}
                                    type="cast"
                                    zIndex={25 - index}
                                />
                            );
                        })}

                        {/* Movie facts */}
                        {pairing.movie.facts?.map((fact, index) => (
                            <FactCard
                                key={`fact-${index}`}
                                fact={fact}
                                position={{
                                    left: `${60 + index * 5}vw`,
                                    top: `${20 + index * 15}vh`,
                                    rotate: `${-2 + Math.random() * 4}deg`
                                }}
                                type={index === 0 ? 'important' : 'trivia'}
                            />
                        ))}

                        {/* Render sticky notes */}
                        {notes.map((note, index) => (
                            <StickyNote key={index} note={note} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}