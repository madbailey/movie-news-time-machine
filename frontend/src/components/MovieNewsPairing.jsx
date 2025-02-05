import { useState, useMemo, useEffect, useRef } from 'react';
// Newspaper styling configurations
const NEWSPAPER_FONTS = [
  'font-crimson font-bold',
  'font-unifraktur',
  'font-playfair italic font-bold',
  'font-fellEnglish',
  'font-crimson italic',
];

const COMMON_WORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
    'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his',
    'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
    'one', 'all', 'would', 'there', 'their', 'before', 'what', 'so', 'up', 'out', 'if',
    'about', 'who', 'get', 'which', 'go', 'me', 'while', 'when', 'make', 'can', 'like',
    'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'your',
    'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look',
    'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
    'how', 'our', 'work', 'first', 'well', 'way', 'even', 'want', 'because',
    'any', 'these', 'give', 'day', 'most', 'us'
  ]);
  
  // Random decorations for text emphasis
  const TEXT_DECORATIONS = [
    'underline',
    'line-through',
    'underline line-through',
    'circle',
    'underline decoration-red-800/40 decoration-wavy',
  'underline decoration-black/50 decoration-double',
  // Combined effects
  'underline decoration-wavy decoration-2 decoration-red-900/40',
  'underline line-through decoration-1 decoration-black/30',
  'underline decoration-double decoration-2 decoration-black/40',
  
  // Offset variations
  'underline underline-offset-4 decoration-black/40',
  'underline underline-offset-2 decoration-wavy decoration-red-800/30',
  ];
  
  
// Function to extract significant words
const getSignificantWords = (text) => {
    return text.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter(word => !COMMON_WORDS.has(word) && word.length > 3);
  };

const NEWSPAPER_STYLES = [
  'border-double border-4 border-black/40',
  'border-dashed border-2 border-black/30',
  'border-solid border-black/50',
];

// Create a unique key for word positions
const createWordKey = (word, index, source) => `${word}-${index}-${source}`;

const ConnectionLines = ({ connections }) => {
    const svgRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
    useEffect(() => {
      const updateDimensions = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };
  
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, []);
  
    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
          <svg 
            ref={svgRef}
            className="absolute inset-0"
            width="100%"
            height="100%"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="none"
          >
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            {connections.map((connection, index) => (
              <g key={index} filter="url(#glow)">
                <path
                  d={`M ${connection.start.x} ${connection.start.y} 
                      C ${connection.start.x + (connection.end.x - connection.start.x) * 0.25} 
                        ${connection.start.y + (connection.end.y - connection.start.y) * 0.1},
                        ${connection.start.x + (connection.end.x - connection.start.x) * 0.75} 
                        ${connection.end.y - (connection.end.y - connection.start.y) * 0.1},
                        ${connection.end.x} ${connection.end.y}`}
                  stroke="rgba(255, 0, 0, 0.4)"
                  strokeWidth="3"
                  fill="none"
                  className="transition-opacity duration-1000"
                />
              </g>
            ))}
          </svg>
        </div>
      );
    };

    const HighlightedText = ({ text, source, onWordPosition, className, connections = [] }) => {
        const containerRef = useRef();
        const words = text.split(' ');
        const observerRef = useRef(null);
        const positionsRef = useRef({});
        const updateTimeoutRef = useRef(null);
      
        // Check if a word is in the connections array
        const isWordConnected = (word) => {
          return connections.some(conn => 
            conn.word === word && 
            (conn.movieSource === source || conn.newsSource === source)
          );
        };
        
        const decoratedWords = useMemo(() => words.map((word, index) => {
          const significantWord = getSignificantWords(word)[0];
          const isSignificant = significantWord && !COMMON_WORDS.has(significantWord);
          const isConnected = isSignificant && isWordConnected(significantWord);
      
          // Only apply random decorations if word is not connected
          const shouldDecorate = !isConnected && Math.random() < 0.1;
          const decoration = shouldDecorate ? 
            TEXT_DECORATIONS[Math.floor(Math.random() * TEXT_DECORATIONS.length)] :
            '';
      
          return {
            word,
            decoration,
            isSignificant,
            significantWord,
            isConnected
          };
        }), [text, connections, source]);
      
        useEffect(() => {
          const updatePositions = () => {
            if (!containerRef.current) return;
            
            const spans = containerRef.current.querySelectorAll('[data-word]');
            const containerRect = containerRef.current.getBoundingClientRect();
            
            const newPositions = {};
      
            spans.forEach(span => {
              const rect = span.getBoundingClientRect();
              const position = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
              };
      
              const key = createWordKey(
                span.dataset.word,
                span.dataset.index,
                source
              );
      
              if (!positionsRef.current[key] ||
                  Math.abs(positionsRef.current[key].x - position.x) > 1 ||
                  Math.abs(positionsRef.current[key].y - position.y) > 1) {
                newPositions[key] = {
                  word: span.dataset.word,
                  position,
                  source
                };
              }
            });
      
            if (Object.keys(newPositions).length > 0) {
              positionsRef.current = { ...positionsRef.current, ...newPositions };
              Object.entries(newPositions).forEach(([key, data]) => {
                onWordPosition(data.word, key.split('-')[1], data.source, data.position);
              });
            }
          };
      
          const debouncedUpdate = () => {
            if (updateTimeoutRef.current) {
              clearTimeout(updateTimeoutRef.current);
            }
            updateTimeoutRef.current = setTimeout(updatePositions, 100);
          };
      
          if (!observerRef.current) {
            observerRef.current = new ResizeObserver(debouncedUpdate);
          }
      
          if (containerRef.current) {
            observerRef.current.observe(containerRef.current);
            debouncedUpdate();
          }
      
          window.addEventListener('scroll', debouncedUpdate);
      
          return () => {
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
            if (updateTimeoutRef.current) {
              clearTimeout(updateTimeoutRef.current);
            }
            window.removeEventListener('scroll', debouncedUpdate);
          };
        }, [text, source, onWordPosition]);
      
        return (
          <div ref={containerRef} className={className}>
            {decoratedWords.map((wordInfo, index) => (
              <span
                key={index}
                className={`
                  ${wordInfo.decoration}
                  ${wordInfo.isSignificant ? 'relative' : ''}
                  ${wordInfo.isConnected ? 
                    'bg-red-100/80 px-1 rounded border-b-2 border-red-400 font-medium relative' : 
                    ''}
                `}
                data-word={wordInfo.isSignificant ? wordInfo.significantWord : null}
                data-index={index}
              >
                {wordInfo.word}
                {wordInfo.isConnected && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full" />
                )}
                {' '}
              </span>
            ))}
          </div>
        );
      };
// More varied positions for a natural cork board look
const POSITIONS = [
    { left: '5vw', top: '5vh', rotate: '-2deg' },
    { left: '65vw', top: '8vh', rotate: '1deg' },
    { left: '5vw', top: '50vh', rotate: '-1deg' },
    { left: '70vw', top: '53vh', rotate: '2deg' },
    { left: '35vw', top: '49vh', rotate: '-1.5deg' },
  ];
const randomFromArray = (array) => array[Math.floor(Math.random() * array.length)];

const NewsClipping = ({ article, position, date, onWordPosition, connections }) => {  
    const styles = useMemo(() => ({
      font: randomFromArray(NEWSPAPER_FONTS),
      border: randomFromArray(NEWSPAPER_STYLES),
      transform: `rotate(${position.rotate})`,
      pageNumber: Math.floor(Math.random() * 20) + 1,
    }), [position.rotate]);
  
    return (
      <div
        className="absolute w-[450px] transition-transform hover:scale-105 hover:z-40"
        style={{
          left: position.left,
          top: position.top,
          transform: styles.transform,
          zIndex: 30,
        }}
      >
        <div className={`bg-[#f4f1e9] shadow-2xl ${styles.border} relative`}>
          {/* Add torn paper effect at the top */}
          <div className="h-3 w-full bg-[#f4f1e9] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/torn-paper.png')] bg-repeat-x opacity-50" />
          </div>

          {/* Enhanced thumbtack - now centered at top */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6">
            <div className="absolute w-6 h-6 rounded-full bg-red-700 shadow-lg" />
            <div className="absolute w-3 h-3 rounded-full bg-white/40 top-1.5 left-1.5" />
          </div>

          <div className="bg-white p-5 relative">
            {/* Enhanced newspaper header */}
            <div className="border-b-2 border-black/70 pb-2 mb-4 flex justify-between items-baseline">
              <div className="flex flex-col">
                <span className="text-sm font-crimson font-bold tracking-wider text-gray-900">THE NEW YORK TIMES</span>
                {article.section && (
                  <span className="text-xs font-crimson text-gray-700 uppercase tracking-wide">{article.section}</span>
                )}
              </div>
              <span className="text-sm text-gray-700 font-crimson">{date}</span>
            </div>
  
            {/* Enhanced headline */}
            <h3 className={`${styles.font} text-xl mb-3 leading-tight`}>
            <HighlightedText
        text={article.headline}
        source={`headline-${article.headline?.substring(0, 20)}`}
        onWordPosition={onWordPosition}
        connections={connections}
        className="font-bold"
      />
            </h3>
  
            {/* Enhanced byline */}
            {article.byline && (
              <p className="text-sm font-crimson italic mb-3 text-gray-700">
                {article.byline}
              </p>
            )}
  
            {/* Enhanced article text */}
            <div className="relative overflow-hidden">
            <HighlightedText
        text={article.fullText?.substring(0, 500) || ''}
        source={`article-${article.headline?.substring(0, 20)}`}
        onWordPosition={onWordPosition}
        connections={connections}
        className="font-crimson text-sm leading-relaxed text-gray-800 bg-[#f4f1e9]/30"
      />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
            </div>
  
            {/* Enhanced footer */}
            <div className="border-t border-black/20 mt-4 pt-2 flex justify-between items-center">
              <span className="text-xs italic text-gray-600 font-crimson">
                Continued on Page {styles.pageNumber}
              </span>
              {article.word_count && (
                <span className="text-xs text-gray-500 font-crimson">
                  {article.word_count} words
                </span>
              )}
            </div>
          </div>

          {/* Add torn paper effect at the bottom */}
          <div className="h-3 w-full bg-[#f4f1e9] relative overflow-hidden rotate-180">
            <div className="absolute inset-0 bg-[url('/torn-paper.png')] bg-repeat-x opacity-50" />
          </div>
        </div>
      </div>
    );
};
const AmbientBackground = () => (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black">
        {/* Animated particles */}
        <div className="absolute w-full h-full opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

const MovieCard = ({ movie, onWordPosition, connections }) => (
    <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105">
      <div className="bg-white p-4 rounded shadow-xl w-[600px] border-4 border-double border-black/30 flex gap-4">
        {/* Left side - Poster and basic info */}
        <div className="w-[250px] flex-shrink-0">
          {movie.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full rounded shadow-lg mb-2"
            />
          )}
          <div className="text-center">
            <h2 className="text-lg font-playfair font-bold mb-1 text-black">{movie.title}</h2>
            <p className="text-xs font-crimson text-black">
              Released: {new Date(movie.release_date).toLocaleDateString()}
            </p>
          </div>
        </div>
  

        <div className="flex-1 flex flex-col">
            <div className="border-2 border-red-800 p-3 bg-red-50/50 flex-1">
            {/* Top stamp */}
            <div className="text-red-800 font-fellEnglish text-lg border-b-2 border-red-800 pb-2 mb-3">
              Summary
            </div>
            
            {/* Movie details styled as a report */}
            <div className="font-crimson space-y-2">
              <div className="mb-4">

              </div>
              
              <div className="text-sm leading-relaxed">
        <HighlightedText
          text={movie.overview}
          source="movie-overview"
          onWordPosition={onWordPosition}
          connections={connections}
          className="mt-2 font-crimson italic"
        />
      </div>
              
              {movie.vote_average && (
                <div className="mt-4 text-sm">
                  <span className="font-bold">Public Reception:</span>
                  <span className="ml-2">{movie.vote_average}/10</span>
                </div>
              )}
            </div>
  
          </div>
        </div>
      </div>
    </div>
  );

  export default function MovieNewsPairing() {
    const [pairing, setPairing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [wordPositions, setWordPositions] = useState({});
    const [connections, setConnections] = useState([]);
    const [initialized, setInitialized] = useState(false);
    // New state to track connected words
    const [connectedWords, setConnectedWords] = useState([]);
  
    const fetchRandomPairing = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3000/api/random-pairing');
        const data = await response.json();
        setPairing(data);
        // Reset word positions and connections when fetching new data
        setWordPositions({});
        setConnections([]);
      } catch (err) {
        setError('Failed to fetch pairing. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    const handleWordPosition = (word, index, source, position) => {
        // Include source type in the word position data
        const sourceType = source.startsWith('movie-') ? 'movie' : 'newspaper';
        
        setWordPositions(prev => ({
          ...prev,
          [createWordKey(word, index, source)]: { 
            word, 
            position, 
            source,
            sourceType 
          }
        }));
      };
    // Handle word connections
    useEffect(() => {
        const newConnections = [];
        const words = {};
        const newConnectedWords = [];

        // Group positions by word
        Object.values(wordPositions).forEach(({ word, position, source, sourceType }) => {
            if (!words[word]) words[word] = [];
            words[word].push({ position, source, sourceType });
        });

        // Create connections only between movie and newspaper
        Object.entries(words).forEach(([word, positions]) => {
            if (positions.length > 1) {
                const moviePositions = positions.filter(p => p.sourceType === 'movie');
                const newspaperPositions = positions.filter(p => p.sourceType === 'newspaper');

                // For each movie mention, connect to each newspaper mention
                moviePositions.forEach(moviePos => {
                    newspaperPositions.forEach(newsPos => {
                        newConnections.push({
                            start: moviePos.position,
                            end: newsPos.position,
                            word
                        });
                        
                        // Add to connected words array
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

    
  
    // Initial fetch
    useEffect(() => {
      if (!initialized) {
        fetchRandomPairing();
        setInitialized(true);
      }
    }, [initialized]);
  
    return (
        <div className="h-screen w-screen overflow-hidden bg-zinc-900">
            <ConnectionLines connections={connections} />
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

            {error && (
                <div className="text-red-200 text-center bg-red-900/20 p-2 rounded mx-auto max-w-md">
                    {error}
                </div>
            )}

            {!loading && pairing && (
                <div className="relative h-[90vh]">
                    <MovieCard 
                        movie={pairing.movie} 
                        onWordPosition={handleWordPosition}
                        connections={connectedWords}
                    />
                    {pairing.news?.map((article, index) => (
                        <NewsClipping
                            key={index}
                            article={article}
                            position={POSITIONS[index]}
                            date={new Date(pairing.movie.release_date).toLocaleDateString()}
                            onWordPosition={handleWordPosition}
                            connections={connectedWords}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}