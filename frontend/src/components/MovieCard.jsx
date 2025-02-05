import React from 'react';
import HighlightedText from './HighlightedText';

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

export default MovieCard;