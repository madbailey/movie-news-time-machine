import React from 'react';

const Note = ({ position, text, rotation, onHover }) => {
    return (
      <div
        className="absolute w-48 p-3 bg-yellow-100 shadow-lg transition-transform hover:scale-105 cursor-pointer"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `rotate(${rotation}deg)`,
          zIndex: 40,
        }}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        <div className="absolute top-1 left-1 w-4 h-4 bg-red-500/80 rounded-full"></div>
        <p className="text-sm font-caveat text-gray-800 leading-tight">{text}</p>
      </div>
    );
  };

export default Note;