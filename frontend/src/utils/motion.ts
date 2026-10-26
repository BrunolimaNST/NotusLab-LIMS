import { Variants } from 'framer-motion';

/**
 * Variantes de Transição de Página (Apple HIG / Vercel style)
 * Entrada suave com Fade-In e Slide-Up sutil (16px -> 0px)
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1], // Curva cúbica suave estilo iOS/macOS
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/**
 * Orquestrador de Cascata (Staggered Children)
 * Garante que listas e tabelas surjam item por item de forma fluida
 */
export const staggerContainer = (staggerChildren = 0.06, delayChildren = 0.02): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

/**
 * Item individual de cascata
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Efeito Pop com Spring elástico para Modais
 */
export const modalSpringVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.94,
    y: 16,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 26,
      stiffness: 340,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: {
      duration: 0.18,
      ease: 'easeOut',
    },
  },
};

/**
 * Efeito Pop elástico para Banners Críticos / Alertas de Pânico
 */
export const bannerSpringVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: -14,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 22,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -10,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

/**
 * Backdrop escurecido com blur suave
 */
export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};
