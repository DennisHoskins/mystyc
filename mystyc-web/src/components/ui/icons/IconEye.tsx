'use client'

import React from 'react';

export default function IconEye({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      width={size}
      viewBox="0 0 30 31"      
      className={className}
    >
      <g>
        <line transform="rotate(-55 3.88784 9.22665)" y2="10" x2="4" y1="7" x1="4"/>
        <line transform="rotate(-30 8.6821 5.35062)" y2="6" x2="9" y1="3" x1="9"/>
        <line y2="4" x2="15" y1="1" x1="15"/>
        <line transform="rotate(30 21.4548 5.35059)" y2="6" x2="21" y1="3" x1="21"/>
        <line transform="rotate(55 26.3118 9.22662)" y2="10" x2="26" y1="7" x1="26"/>

        <g id="eye">
          <path d="m5.18583,15.5337a1,1 0 0 1 0,-0.696a10.75,10.75 0 0 1 19.876,0a1,1 0 0 1 0,0.696a10.75,10.75 0 0 1 -19.876,0"/>
          <circle cx="15.12383" cy="15.1857" r="3"/>
        </g>

        <line transform="rotate(55 3.88778 21.3018)" y2="24" x2="4" y1="21" x1="4"/>
        <line transform="rotate(30 8.68212 24.9808)" y2="27" x2="9" y1="24" x1="9"/>
        <line y2="29" x2="15" y1="26" x1="15"/>
        <line transform="rotate(-30 21.4548 24.9808)" y2="27" x2="21" y1="24" x1="21"/>
        <line transform="rotate(-55 26.3118 21.3018)" y2="24" x2="26" y1="21" x1="26"/>
      </g>
    </svg>    
  );
}
