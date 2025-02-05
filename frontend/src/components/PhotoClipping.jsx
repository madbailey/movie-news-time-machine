import React from 'react';
import { randomFromArray } from './utils';

const POLAROID_ROTATIONS = ['-3deg', '-2deg', '-1deg', '1deg', '2deg', '3deg'];

const PhotoClipping = ({ 
  imageUrl, 
  caption, 
  position, 
  type = 'cast',  // 'cast' | 'location' | 'evidence'
  zIndex = 25 // Lower base z-index
}) => {
  const rotation = randomFromArray(POLAROID_ROTATIONS);
  
  return (
    <div
      className="absolute w-48 transition-transform hover:scale-105 hover:z-50"
      style={{
        left: position.left,
        top: position.top,
        transform: `rotate(${rotation})`,
        zIndex: position.top < '50vh' ? zIndex : zIndex - 5, // Lower z-index for bottom photos
      }}
    >
      {/* Polaroid-style container */}
      <div className="bg-white p-2 shadow-xl">
        {/* Thumbtack */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4">
          <div className="absolute w-4 h-4 rounded-full bg-zinc-700 shadow-lg" />
          <div className="absolute w-2 h-2 rounded-full bg-white/40 top-1 left-1" />
        </div>

        {/* Photo area */}
        <div className="relative aspect-[3/4] bg-zinc-100 mb-4 overflow-hidden">
          <img
            src={imageUrl}
            alt={caption}
            className="w-full h-full object-cover"
          />
          
          {/* Vintage photo effect overlay */}
          <div className="absolute inset-0 bg-sepia-overlay opacity-20" />
          
          {/* Type indicator */}
          {type === 'evidence' && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              !
            </div>
          )}
        </div>

        {/* Caption area */}
        <div className="px-2 pb-2">
          <p className="text-sm font-permanent-marker text-center text-zinc-800">
            {caption}
          </p>
          
          {type === 'cast' && (
            <p className="text-xs font-indie-flower text-center text-zinc-600 mt-1">
              {"What's their connection?"}
            </p>
          )}
        </div>
      </div>

      {/* Optional scotch tape effect */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-8 bg-white/30 rotate-12 transform" />
    </div>
  );
};

export default PhotoClipping;