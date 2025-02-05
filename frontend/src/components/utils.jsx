export const randomFromArray = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

export const COMMON_WORDS = new Set([
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

// Function to extract significant words
export const getSignificantWords = (text) => {
  return text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .split(/\s+/)
    .filter(word => !COMMON_WORDS.has(word) && word.length > 3);
};

// Create a unique key for word positions
export const createWordKey = (word, index, source) => `${word}-${index}-${source}`;

export const NEWSPAPER_FONTS = [
  'font-crimson font-bold',
  'font-unifraktur',
  'font-playfair italic font-bold',
  'font-fellEnglish',
  'font-crimson italic',
];

export const NEWSPAPER_STYLES = [
  'border-double border-4 border-black/40',
  'border-dashed border-2 border-black/30',
  'border-solid border-black/50',
];

// Random decorations for text emphasis
export const TEXT_DECORATIONS = [
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

// Import existing POSITIONS from MovieNewsPairing
export const POSITIONS = [
    { left: '10%', top: '15%' },     // top left
    { left: '70%', top: '20%' },     // top right
    { left: '15%', top: '60%' },     // bottom left
    { left: '75%', top: '65%' },     // bottom right
    { left: '45%', top: '75%' }      // bottom center
];

// Convert percentage string to number
const parsePercentage = (value) => parseInt(value.replace('%', ''));

// Define forbidden zones (newspaper positions + movie card)
const FORBIDDEN_ZONES = [
    // Movie card in center
    { minX: 40, maxX: 60, minY: 35, maxY: 65 },
    // Add buffer zones around each newspaper position
    ...POSITIONS.map(pos => ({
        minX: parsePercentage(pos.left) - 15,
        maxX: parsePercentage(pos.left) + 15,
        minY: parsePercentage(pos.top) - 10,
        maxY: parsePercentage(pos.top) + 10
    }))
];

// Available spaces for photos (avoiding forbidden zones)
const PHOTO_SPACES = [
    { minX: 25, maxX: 35, minY: 15, maxY: 35 },  // Upper left gap
    { minX: 65, maxX: 75, minY: 35, maxY: 55 },  // Middle right gap
    { minX: 15, maxX: 25, minY: 35, maxY: 55 },  // Middle left gap
    { minX: 45, maxX: 55, minY: 70, maxY: 85 },  // Lower gap
];

export const getRandomPosition = (index) => {
    // Pick a space that avoids forbidden zones
    const space = PHOTO_SPACES[index % PHOTO_SPACES.length];
    
    // Add some randomness within the safe space
    const x = space.minX + (Math.random() * (space.maxX - space.minX));
    const y = space.minY + (Math.random() * (space.maxY - space.minY));
    
    return {
        left: `${x}vw`,
        top: `${y}vh`
    };
};

export const randomRotation = () => `${-2 + Math.random() * 4}deg`;