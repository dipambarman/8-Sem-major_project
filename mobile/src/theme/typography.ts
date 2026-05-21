// ─── PREMIUM TYPOGRAPHY SYSTEM ────────────────────────────────────
import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.OS === 'ios' ? 'System' : 'Roboto';

export const Typography: Record<string, TextStyle> = {
  // ─── Headings ───────────────────────────────────────────────────
  h1: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontFamily,
  },
  h2: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
    fontFamily,
  },
  h3: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontFamily,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0,
    fontFamily,
  },

  // ─── Body ───────────────────────────────────────────────────────
  bodyLg: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    fontFamily,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    fontFamily,
  },
  bodySm: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    fontFamily,
  },

  // ─── Labels ─────────────────────────────────────────────────────
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily,
  },
  labelSm: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily,
  },

  // ─── Captions ───────────────────────────────────────────────────
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    fontFamily,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    fontFamily,
  },

  // ─── Special ────────────────────────────────────────────────────
  price: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily,
  },
  priceLg: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily,
  },
  button: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily,
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
};
