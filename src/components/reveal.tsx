"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import type { ReactNode } from "react";

/**
 * Scroll-triggered reveal. Deliberately understated: a short rise and a fade,
 * nothing that draws attention to itself. `delay` staggers siblings.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Counts up when scrolled into view. Driven by a motion value rendered
 * directly, so there is no per-frame React state update.
 */
export function CountUp({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  const count = useMotionValue(0);
  const text = useTransform(count, (v) => Math.round(v).toLocaleString("en-ZA"));

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(count, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, reduced, value, count]);

  if (reduced) {
    return <span className={className}>{value.toLocaleString("en-ZA")}</span>;
  }

  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  );
}
