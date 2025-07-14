import { useAppearance } from '../../hooks/use-appearance';
import { Sun, Moon } from 'lucide-react';

export default function DarkModeToggle() {
  const { appearance, updateAppearance } = useAppearance();
  const isDark = appearance === 'dark' || (appearance === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button
      aria-label="Toggle dark mode"
      className="fixed bottom-6 right-6 z-50 rounded-full bg-[#7e246c] text-white shadow-lg w-14 h-14 flex items-center justify-center transition hover:bg-[#6a1f5c] focus:outline-none"
      onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="h-7 w-7" /> : <Moon className="h-7 w-7" />}
    </button>
  );
} 