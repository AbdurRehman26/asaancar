import { useAppearance } from '@/hooks/use-appearance';
import { Moon, Sun } from 'lucide-react';
import { Button } from './button';

export default function DarkModeToggle() {
  const { appearance, updateAppearance } = useAppearance();

  const toggleTheme = () => {
    const newTheme = appearance === 'dark' ? 'light' : 'dark';
    updateAppearance(newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-md"
    >
      {appearance === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
} 