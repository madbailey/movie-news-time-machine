import React from 'react';

const StickyNote = ({ note }) => {
    const colorClasses = {
      yellow: 'bg-amber-100',
      blue: 'bg-sky-100',
      green: 'bg-emerald-100',
      pink: 'bg-rose-100'
    };

    const handwritingClasses = {
      messy: 'font-permanent-marker',
      neat: 'font-indie-flower'
    };

    return (
      <div
        className={`absolute w-48 h-48 shadow-lg transition-transform hover:scale-105 hover:z-50 cursor-pointer ${colorClasses[note.style.color]}`}
        style={{
          top: note.position.top,
          left: note.position.left,
          transform: `rotate(${note.position.rotate})`,
          zIndex: 40,
        }}
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6">
          <div className="absolute w-4 h-4 rounded-full bg-zinc-700 shadow" />
        </div>

        <div className={`p-4 text-sm ${handwritingClasses[note.style.handwriting]} text-zinc-800`}>
          {note.content}

          {note.type === 'thematic' && (
            <div className="mt-2 text-xs opacity-70">
              Theme: {note.theme}
            </div>
          )}
        </div>
      </div>
    );
  };

export default StickyNote;