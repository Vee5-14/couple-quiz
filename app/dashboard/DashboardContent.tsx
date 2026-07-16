'use client';
import { useState, useEffect } from 'react';
import ThemeToggle from '@/app/components/ThemeToggle';
import { useTheme } from '@/app/context/ThemeContext';

// Rest of your imports (keep your existing ones)
// ... your other imports

export default function DashboardContent() {
  const { theme } = useTheme(); // ✅ Correct: useTheme, not useState
  // ... rest of your dashboard logic

  // Your existing dashboard code here
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <ThemeToggle />
      {/* ... rest of your dashboard JSX */}
    </div>
  );
}