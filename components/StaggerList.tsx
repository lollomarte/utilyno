"use client";

import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function StaggerList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.ol variants={container} initial="hidden" animate="show" className={className}>
      {children}
    </motion.ol>
  );
}

export function StaggerItem({ children }: { children: React.ReactNode }) {
  return <motion.li variants={item}>{children}</motion.li>;
}
