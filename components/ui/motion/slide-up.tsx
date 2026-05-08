"use client";

import { motion, useReducedMotion } from "framer-motion";

type SlideUpProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Slide-up helper for subtle entrance transitions.
 * We keep values small to avoid distracting motion in dashboard UI.
 */
export function SlideUp({ children, className, delay = 0 }: SlideUpProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
}

