import * as React from 'react';
import { AlertCircle, Lock } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Locale } from '../../lib/vault-utils';
import { cycleFocusOnTab } from '../../lib/focus';
import { t } from '../../locales';

export function LockPanel({
  locale,
  title,
  subtitle,
  onSubmit,
  buttonText,
  secondaryButtonText,
  showConfirm,
  onSecondary,
  isBusy,
}: {
  locale: Locale;
  title: string;
  subtitle: string;
  onSubmit: (password: string, confirmPassword?: string) => Promise<void>;
  buttonText: string;
  secondaryButtonText?: string;
  onSecondary?: () => void;
  showConfirm: boolean;
  isBusy: boolean;
}) {
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isMasterCapsLockOn, setIsMasterCapsLockOn] = React.useState(false);
  const [isConfirmCapsLockOn, setIsConfirmCapsLockOn] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-center px-6 py-12">
      <Card className="vault-panel w-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{subtitle}</CardDescription>
            </div>
            <Lock size={22} className="mt-1 text-slate-600 dark:text-slate-300" />
          </div>
        </CardHeader>
        <CardContent>
          <form
            ref={formRef}
            className="space-y-4"
            onKeyDown={(event) => cycleFocusOnTab(event, formRef.current)}
            onSubmit={async (event) => {
              event.preventDefault();
              await onSubmit(password, confirmPassword || undefined);
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="master-password">{t(locale, 'masterPassword')}</Label>
              <Input
                id="master-password"
                type="password"
                value={password}
                autoFocus
                onKeyDown={(event) => setIsMasterCapsLockOn(event.getModifierState('CapsLock'))}
                onKeyUp={(event) => setIsMasterCapsLockOn(event.getModifierState('CapsLock'))}
                onBlur={() => setIsMasterCapsLockOn(false)}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
              />
              {isMasterCapsLockOn ? (
                <p className="mt-1 flex items-center gap-2 text-sm text-rose-600">
                  <AlertCircle size={14} />
                  {t(locale, 'capsLockOn')}
                </p>
              ) : null}
            </div>

            {showConfirm ? (
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">{t(locale, 'confirmPassword')}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onKeyDown={(event) => setIsConfirmCapsLockOn(event.getModifierState('CapsLock'))}
                  onKeyUp={(event) => setIsConfirmCapsLockOn(event.getModifierState('CapsLock'))}
                  onBlur={() => setIsConfirmCapsLockOn(false)}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="********"
                />
                {isConfirmCapsLockOn ? (
                  <p className="mt-1 flex items-center gap-2 text-sm text-rose-600">
                    <AlertCircle size={14} />
                    {t(locale, 'capsLockOn')}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              {showConfirm && onSecondary ? (
                <Button type="button" variant="ghost" onClick={onSecondary} disabled={isBusy}>
                  {secondaryButtonText}
                </Button>
              ) : null}
              <Button type="submit" disabled={isBusy}>
                {isBusy ? t(locale, 'loading') : buttonText}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
