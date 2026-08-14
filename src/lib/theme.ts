export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'hlw_theme_v1';

export const THEME_COLORS: Record<Theme, string> = {
  dark: '#0D0810',
  light: '#FFF8FA',
};

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
}

/**
 * Runs before first paint, inlined into <head>, so the correct theme is on
 * <html> before React hydrates and the page never flashes the wrong palette.
 * Kept as a string because it must execute synchronously — a component cannot.
 */
export const themeInitScript = `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`.trim();
