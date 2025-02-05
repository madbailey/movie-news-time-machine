import React, { useMemo } from 'react';
import HighlightedText from './HighlightedText';
import { NEWSPAPER_FONTS, NEWSPAPER_STYLES, randomFromArray } from './utils';

const NewsClipping = ({ article, position = {}, date, onWordPosition, connections }) => {
    const styles = useMemo(() => ({
      font: randomFromArray(NEWSPAPER_FONTS),
      border: randomFromArray(NEWSPAPER_STYLES),
      transform: `rotate(${position?.rotate || '0deg'})`,
      pageNumber: Math.floor(Math.random() * 20) + 1,
    }), [position?.rotate]);

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

export default NewsClipping;