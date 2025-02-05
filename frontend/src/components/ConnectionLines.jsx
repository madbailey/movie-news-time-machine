import React, { useRef, useEffect, useState } from 'react';

const ConnectionLines = ({ connections,
    stringColor = 'rgba(45,0,0,0.8)',
    stringWidth = 3,
    glowIntensity = 1.5,
    animate = true 
 }) => {
    const svgRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setDimensions({ width, height });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const getControlPoints = (start, end) => {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        // Add some randomness to make it look more natural
        const randX = (Math.random() - 0.5) * 50;
        const randY = (Math.random() - 0.5) * 30;
        
        return {
            cp1: {
                x: start.x + (midX - start.x) * 0.25 + randX,
                y: start.y + (midY - start.y) * 0.25 + randY
            },
            cp2: {
                x: end.x - (end.x - midX) * 0.25 + randX,
                y: end.y - (end.y - midY) * 0.25 + randY
            }
        };
    };

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
                <defs>
                    {/* Enhanced glow filter */}
                    <filter id="string-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur1" />
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur1" />
                            <feMergeNode in="blur2" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    
                    {/* String texture */}
                    <pattern id="string-texture" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                        <path d="M1,1 L3,3" stroke="rgba(255,0,0,0.3)" strokeWidth="0.5" />
                    </pattern>
                </defs>

                {connections.map((connection, index) => {
                    const { cp1, cp2 } = getControlPoints(connection.start, connection.end);
                    const pathId = `string-path-${index}`;
                    
                    return (
                        <g key={index} filter="url(#string-glow)">
                            {/* Shadow for depth */}
                            <path
                                d={`M ${connection.start.x} ${connection.start.y} 
                                   C ${cp1.x} ${cp1.y},
                                     ${cp2.x} ${cp2.y},
                                     ${connection.end.x} ${connection.end.y}`}
                                stroke="rgba(0,0,0,0.3)"
                                strokeWidth="5"
                                fill="none"
                                transform="translate(2,2)"
                            />
                            
                            {/* Base string */}
                            <path
                                id={pathId}
                                d={`M ${connection.start.x} ${connection.start.y} 
                                   C ${cp1.x} ${cp1.y},
                                     ${cp2.x} ${cp2.y},
                                     ${connection.end.x} ${connection.end.y}`}
                                stroke="rgba(180,0,0,0.8)"
                                strokeWidth="3"
                                fill="none"
                                className="transition-all duration-500"
                            />
                            
                            {/* Texture overlay */}
                            <path
                                d={`M ${connection.start.x} ${connection.start.y} 
                                   C ${cp1.x} ${cp1.y},
                                     ${cp2.x} ${cp2.y},
                                     ${connection.end.x} ${connection.end.y}`}
                                stroke="url(#string-texture)"
                                strokeWidth="3"
                                fill="none"
                                opacity="0.5"
                            />
                            
                            {/* Highlight for dimensionality */}
                            <path
                                d={`M ${connection.start.x} ${connection.start.y} 
                                   C ${cp1.x} ${cp1.y},
                                     ${cp2.x} ${cp2.y},
                                     ${connection.end.x} ${connection.end.y}`}
                                stroke="rgba(255,100,100,0.4)"
                                strokeWidth="1"
                                fill="none"
                                className="transition-all duration-500"
                            />
                            
                            {/* Add small circles at endpoints for better anchoring */}
                            <circle cx={connection.start.x} cy={connection.start.y} r="2" fill="rgba(180,0,0,0.8)" />
                            <circle cx={connection.end.x} cy={connection.end.y} r="2" fill="rgba(180,0,0,0.8)" />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default ConnectionLines;