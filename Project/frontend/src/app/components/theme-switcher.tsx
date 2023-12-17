import { useTheme } from 'next-themes';
import { MoonFilledIcon, SunFilledIcon } from './icons';

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        {theme === 'light' ? (
          <MoonFilledIcon size={24} />
        ) : (
          <SunFilledIcon size={24} />
        )}
      </button>
    </div>
  );
};
