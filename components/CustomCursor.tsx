import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface Props {
  theme: 'dark' | 'light';
}

const CustomCursor: React.FC<Props> = ({ theme }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringText, setIsHoveringText] = useState(false);

  // Mouse position state
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring physics for the trailing ring
  const springConfig = { damping: 25, stiffness: 400, mass: 0.2 }; // Tighter spring for professional feel
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Detect text inputs/areas where we want NATIVE cursor
      const isText = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.getAttribute('contenteditable') === 'true' ||
        window.getComputedStyle(target).cursor === 'text';

      setIsHoveringText(!!isText);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  const isDark = theme === 'dark';

  // If we are hovering text, we hide the custom cursor completely
  // so the native browser cursor (I-beam) can take over.
  if (isHoveringText) return null;

  return (
    <>
      {/* Main Dot - Follows mouse instantly */}
      <motion.div
        className={`fixed top-0 left-0 pointer-events-none z-[9999] rounded-full mix-blend-difference ${isDark ? 'bg-cyan-400' : 'bg-blue-600'}`}
        animate={{
          scale: isClicked ? 0.5 : 1
        }}
        transition={{ duration: 0.1 }}
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          width: 8,
          height: 8,
          opacity: isVisible ? 1 : 0
        }}
      />

      {/* Trailing Ring - Follows with physics, reacts ONLY to click */}
      <motion.div
        className={`fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border transition-colors duration-300 ${
          isDark ? 'border-cyan-500/80' : 'border-blue-600/50'
        }`}
        animate={{
          scale: isClicked ? 0.8 : 1,
          borderWidth: isClicked ? '2px' : '1px',
        }}
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          width: 24,
          height: 24,
          opacity: isVisible ? 0.6 : 0
        }}
      />
    </>
  );
};

export default CustomCursor;