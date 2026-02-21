import type { KeyboardEvent } from 'react';

const FOCUSABLE_SELECTOR = [
  'input:not([type="hidden"]):not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function cycleFocusOnTab(event: KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== 'Tab' || !container) return;

  const focusableElements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');

  if (focusableElements.length <= 1) return;

  const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
  if (currentIndex < 0) return;

  event.preventDefault();
  const nextIndex = event.shiftKey
    ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
    : (currentIndex + 1) % focusableElements.length;
  focusableElements[nextIndex].focus();
}
