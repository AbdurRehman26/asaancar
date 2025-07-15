import { useAppearance } from '../../hooks/use-appearance';
import { Sun, Moon } from 'lucide-react';

export default function DarkModeToggle() {
  const { appearance, updateAppearance } = useAppearance();
  const isDark = appearance === 'dark' || (appearance === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button
      aria-label="Toggle dark mode"
      className="ml-2 rounded-md bg-transparent text-[#7e246c] dark:text-white hover:bg-[#f3e6f0] dark:hover:bg-gray-700 transition w-10 h-10 flex items-center justify-center focus:outline-none"
      onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
      type="button"
    >
      {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
    </button>
  );
} 