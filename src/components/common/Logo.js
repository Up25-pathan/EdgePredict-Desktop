import React from 'react';

const Logo = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Glow (Optional) */}
      <rect width="40" height="40" rx="8" className="fill-indigo-900/50" />
      
      {/* Main E Shape - Stylized as Circuit/Arrow */}
      <path 
        d="M12 10H24L28 14M12 20H20M12 30H24L28 26" 
        stroke="url(#logo-gradient)" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Circuit Nodes */}
      <circle cx="28" cy="14" r="2" className="fill-cyan-400" />
      <circle cx="28" cy="26" r="2" className="fill-cyan-400" />
      <circle cx="10" cy="10" r="2" className="fill-indigo-500" />
      <circle cx="10" cy="20" r="2" className="fill-indigo-500" />
      <circle cx="10" cy="30" r="2" className="fill-indigo-500" />

      {/* Gradient Definition */}
      <defs>
        <linearGradient id="logo-gradient" x1="12" y1="10" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" /> {/* Indigo */}
          <stop offset="1" stopColor="#22d3ee" /> {/* Cyan */}
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;