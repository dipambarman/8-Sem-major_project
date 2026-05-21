// ─── SMART CANTEEN PREMIUM DARK THEME ─────────────────────────────
// A luxurious dark color palette inspired by 5-star dining experiences

export const Colors = {
  // ─── Backgrounds ────────────────────────────────────────────────
  background: {
    primary: '#0A0E1A',      // Deep navy black
    secondary: '#111827',     // Dark charcoal
    tertiary: '#1A2236',      // Elevated surface
    card: '#1E2640',          // Card surfaces
    elevated: '#243050',      // Modal/overlay surfaces
    input: '#1A2236',         // Input field backgrounds
  },

  // ─── Gold / Amber Accents (Luxury) ──────────────────────────────
  accent: {
    primary: '#D4A574',       // Warm gold
    secondary: '#C9963B',     // Deep amber gold
    tertiary: '#E8C89E',      // Light gold
    muted: 'rgba(212, 165, 116, 0.15)', // Subtle gold bg
    glow: 'rgba(212, 165, 116, 0.3)',   // Gold glow effect
  },

  // ─── Text ───────────────────────────────────────────────────────
  text: {
    primary: '#FFFFFF',       // Main text
    secondary: '#9CA3AF',     // Subtle text
    tertiary: '#6B7280',      // Disabled/hint
    gold: '#D4A574',          // Accent text
    inverse: '#0A0E1A',       // Text on light surfaces
  },

  // ─── Status Colors ──────────────────────────────────────────────
  status: {
    success: '#10B981',       // Emerald green
    warning: '#F59E0B',       // Amber warning
    error: '#EF4444',         // Red error
    info: '#3B82F6',          // Blue info
    pending: '#F59E0B',
  },

  // ─── Card Tiers (Loyalty System) ────────────────────────────────
  tiers: {
    bronze: {
      primary: '#CD7F32',
      gradient: ['#CD7F32', '#A0522D'] as const,
    },
    silver: {
      primary: '#C0C0C0',
      gradient: ['#C0C0C0', '#808080'] as const,
    },
    gold: {
      primary: '#FFD700',
      gradient: ['#FFD700', '#DAA520'] as const,
    },
    platinum: {
      primary: '#E5E4E2',
      gradient: ['#E5E4E2', '#B4B4B4'] as const,
    },
    black: {
      primary: '#2D2D2D',
      gradient: ['#434343', '#1A1A1A'] as const,
    },
  },

  // ─── Gradients ──────────────────────────────────────────────────
  gradients: {
    hero: ['#0A0E1A', '#1A2236'] as const,
    goldCta: ['#D4A574', '#C9963B'] as const,
    darkCard: ['rgba(30, 38, 64, 0.9)', 'rgba(26, 34, 54, 0.95)'] as const,
    premium: ['#D4A574', '#B8860B', '#C9963B'] as const,
    glass: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] as const,
    header: ['#0A0E1A', '#111827', '#1A2236'] as const,
    success: ['#10B981', '#059669'] as const,
    danger: ['#EF4444', '#DC2626'] as const,
    dineIn: ['#7C3AED', '#5B21B6'] as const,
    reserve: ['#2563EB', '#1D4ED8'] as const,
  },

  // ─── Borders & Dividers ─────────────────────────────────────────
  border: {
    primary: 'rgba(255, 255, 255, 0.08)',
    secondary: 'rgba(255, 255, 255, 0.04)',
    gold: 'rgba(212, 165, 116, 0.3)',
    active: '#D4A574',
  },

  // ─── Shadow ─────────────────────────────────────────────────────
  shadow: {
    color: '#000000',
    gold: '#D4A574',
  },

  // ─── Tab Bar ────────────────────────────────────────────────────
  tabBar: {
    background: '#0D1220',
    active: '#D4A574',
    inactive: '#4B5563',
    border: 'rgba(255, 255, 255, 0.06)',
  },
};

// ─── Spacing Scale ────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

// ─── Border Radius Scale ──────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 100,
  card: 18,
  button: 14,
};
