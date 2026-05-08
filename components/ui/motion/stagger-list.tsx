"use client";

import { motion, useReducedMotion } from "framer-motion";

type StaggerListProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Reusable list wrapper for staggered child entrance.
 * This keeps motion usage consistent instead of duplicating animation setup.
 */
export function StaggerList({ children, className }: StaggerListProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Child helper used with StaggerList.
 * Each child has a small upward fade transition.
 */
export function StaggerItem({ children, className }: StaggerListProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

