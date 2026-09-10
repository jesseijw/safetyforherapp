// Pulled directly from the :root CSS variables in the HTML mockup
export const colors = {
  ink: '#2d1d20',
  muted: '#75676a',
  line: '#eadbd6',
  blue: '#d97468',
  blueDark: '#bd5f55',
  red: '#c93f3f',
  green: '#668b70',
  yellow: '#c99b62',
  panel: '#fffaf7',
  map: '#eee7e3',
  cream: '#fff8f4',
  blush: '#f6e5df',
  coral: '#d97468',
  sosRed: '#c83d3d',
  sosBg: '#fff0f1',
  sosText: '#e33d49',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radii = {
  sm: 10,
  md: 15,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const typography = {
  title: { fontSize: 19, fontWeight: '800', color: colors.ink },
  sectionLabel: {
    fontSize: 12,
    color: '#9c625d',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  body: { fontSize: 14, color: colors.ink },
  muted: { fontSize: 12, color: colors.muted },
};