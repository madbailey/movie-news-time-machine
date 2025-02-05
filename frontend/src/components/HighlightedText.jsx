import React, { useState, useMemo, useEffect, useRef } from 'react';
import { getSignificantWords, COMMON_WORDS, TEXT_DECORATIONS, createWordKey } from './utils';

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
        const newNotes = [];

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

export default HighlightedText;