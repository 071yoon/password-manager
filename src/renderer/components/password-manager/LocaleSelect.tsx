import { ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ChromeControlButton } from './ChromeControlButton';
import { Locale } from '../../lib/vault-utils';

export type LocaleSelectProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  className?: string;
};

export function LocaleSelect({ locale, onLocaleChange, className = 'w-16' }: LocaleSelectProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ChromeControlButton className={`${className} justify-between`}>
          <span className="font-medium">{locale.toUpperCase()}</span>
          <ChevronDown size={14} />
        </ChromeControlButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-16">
        <DropdownMenuItem onSelect={() => onLocaleChange('en')}>EN</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onLocaleChange('ko')}>KO</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
