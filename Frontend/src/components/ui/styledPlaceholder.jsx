import React from 'react';

export const StyledPlaceholder = ({ className }) => (
  <div className={`w-full h-full ${className}`}>
    <svg 
      viewBox="0 0 400 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <rect width="400" height="400" fill="#f3f4f6"/>
      
      {/* Decorative background pattern */}
      <path 
        d="M0 0L400 400M400 0L0 400" 
        stroke="#e5e7eb" 
        strokeWidth="2" 
        strokeDasharray="8 8"
      />
      
      {/* Stylized camera icon */}
      <g transform="translate(160, 160)">
        <rect 
          x="0" 
          y="0" 
          width="80" 
          height="60" 
          rx="8" 
          fill="#d1d5db"
        />
        <circle 
          cx="40" 
          cy="30" 
          r="15" 
          fill="#9ca3af"
          stroke="#f3f4f6"
          strokeWidth="3"
        />
        <rect 
          x="60" 
          y="5" 
          width="10" 
          height="10" 
          rx="2" 
          fill="#9ca3af"
        />
      </g>
      
      {/* Message text */}
      <text 
        x="200" 
        y="280" 
        textAnchor="middle" 
        fill="#6b7280" 
        fontFamily="ui-sans-serif, system-ui, sans-serif" 
        fontSize="14"
      >
        Image not available
      </text>
    </svg>
  </div>
);