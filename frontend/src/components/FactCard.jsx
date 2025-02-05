import React from 'react';

const FactCard = ({ fact, position, type = 'trivia' }) => {
  return (
    <div
      className="absolute w-56 transition-transform hover:scale-105 hover:z-50"
      style={{
        left: position.left,
        top: position.top,
        transform: `rotate(${position.rotate || '0deg'})`,
        zIndex: 35,
      }}
    >
      {/* Index card style container */}
      <div className="bg-[#fff5e0] p-4 shadow-lg border-b-2 border-r-2 border-zinc-200">
        {/* Red stamp for important facts */}
        {type === 'important' && (
          <div className="absolute -top-4 -right-4 w-12 h-12">
            <div className="absolute inset-0 bg-red-600 rounded-full opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold rotate-12">
              KEY
            </div>
          </div>
        )}

        {/* Pin */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4">
          <div className="absolute w-4 h-4 rounded-full bg-yellow-600 shadow" />
        </div>

        {/* Content */}
        <div className="mt-2">
          <p className="font-indie-flower text-sm leading-snug text-zinc-800">
            {fact}
          </p>
        </div>

        {/* Optional source citation */}
        {fact.source && (
          <div className="mt-2 text-right">
            <span className="text-xs font-permanent-marker text-zinc-500">
              - {fact.source}
            </span>
          </div>
        )}

        {/* Lined paper effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-blue-200/20"
              style={{ top: `${(i + 1) * 12}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FactCard;