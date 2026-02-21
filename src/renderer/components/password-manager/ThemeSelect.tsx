import { ChevronDown, Monitor, Moon, Sun } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ChromeControlButton } from './ChromeControlButton';
import { ThemeMode } from '../../lib/vault-utils';

export type ThemeModeLabel = {
  system: string;
  light: string;
  dark: string;
};

export type ThemeSelectProps = {
  mode: ThemeMode;
  labels: ThemeModeLabel;
  onModeChange: (mode: ThemeMode) => void;
  className?: string;
};

export function ThemeSelect({ mode, labels, onModeChange, className = 'w-24' }: ThemeSelectProps) {
  const selectedLabel =
    mode === 'system' ? labels.system : mode === 'light' ? labels.light : labels.dark;
  const icon =
    mode === 'light' ? (
      <Sun size={14} />
    ) : mode === 'dark' ? (
      <Moon size={14} />
    ) : (
      <Monitor size={14} />
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ChromeControlButton className={`${className} justify-between`}>
          <span className="inline-flex items-center gap-1 font-medium">
            {icon} {selectedLabel}
          </span>
          <ChevronDown size={14} />
        </ChromeControlButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-24">
        <DropdownMenuItem onSelect={() => onModeChange('system')}>
          <span className="inline-flex items-center gap-2">
            <Monitor size={14} /> {labels.system}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onModeChange('light')}>
          <span className="inline-flex items-center gap-2">
            <Sun size={14} /> {labels.light}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onModeChange('dark')}>
          <span className="inline-flex items-center gap-2">
            <Moon size={14} /> {labels.dark}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
