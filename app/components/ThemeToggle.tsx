'use client';
import { useTheme } from '@/app/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition shadow-lg"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <span className="text-2xl">🌙</span>
      ) : (
        <span className="text-2xl">☀️</span>
      )}
    </button>
  );
}