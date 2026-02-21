export function isWindowsPlatform() {
  if (typeof navigator === 'undefined') return false;
  return /win/i.test(navigator.platform || '');
}

export function isMacPlatform() {
  if (typeof navigator === 'undefined') return false;
  return /mac/i.test(navigator.platform || '');
}
