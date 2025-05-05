import React from 'react';
import { motion } from 'framer-motion'; 

export const motion = {
  div: ({ initial, animate, className, children }) => {
    const animationClass = 
      initial === 'hidden' && animate === 'visible' 
        ? 'animate-fadeIn' 
        : '';
    
    return (
      <div className={`${className} ${animationClass}`}>
        {children}
      </div>
    );
  }
};