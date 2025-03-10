'use client';

import { useEffect, useCallback, useState } from 'react';

export type KeyboardAction = 'next' | 'previous' | 'submit' | 'cancel' | 'save' | 'delete' | 'escape';

export interface KeyboardShortcut {
  key: string;
  action: KeyboardAction;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  description: string;
}

export interface KeyboardNavigationOptions {
  shortcuts?: KeyboardShortcut[];
  enabled?: boolean;
  focusableSelector?: string;
}

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  { key: 'ArrowDown', action: 'next', description: 'Move to next item' },
  { key: 'ArrowUp', action: 'previous', description: 'Move to previous item' },
  { key: 'Enter', action: 'submit', description: 'Submit or select current item' },
  { key: 'Escape', action: 'cancel', description: 'Cancel or go back' },
  { key: 's', action: 'save', ctrlKey: true, description: 'Save (Ctrl+S)' },
  { key: 'Delete', action: 'delete', description: 'Delete current item' },
];

const DEFAULT_FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Custom hook for keyboard navigation
 */
export function useKeyboardNavigation({
  shortcuts = DEFAULT_SHORTCUTS,
  enabled = true,
  focusableSelector = DEFAULT_FOCUSABLE_SELECTOR,
}: KeyboardNavigationOptions = {}): {
  currentFocusIndex: number;
  focusableElements: HTMLElement[];
  handleAction: (action: KeyboardAction) => void;
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string) => void;
  getShortcutList: () => KeyboardShortcut[];
} {
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const [currentFocusIndex, setCurrentFocusIndex] = useState<number>(-1);
  const [activeShortcuts, setActiveShortcuts] = useState<KeyboardShortcut[]>(shortcuts);

  // Update focusable elements when the DOM changes
  useEffect(() => {
    if (!enabled) return;

    const updateFocusableElements = (): void => {
      const elements = Array.from(
        document.querySelectorAll(focusableSelector)
      ) as HTMLElement[];
      
      setFocusableElements(elements);
      
      // Find the currently focused element
      const focusedElement = document.activeElement as HTMLElement;
      const focusedIndex = elements.findIndex(el => el === focusedElement);
      
      if (focusedIndex !== -1) {
        setCurrentFocusIndex(focusedIndex);
      }
    };

    // Initial update
    updateFocusableElements();

    // Set up a mutation observer to detect DOM changes
    const observer = new MutationObserver(updateFocusableElements);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [enabled, focusableSelector]);

  // Handle keyboard navigation
  const handleAction = useCallback((action: KeyboardAction): void => {
    if (!enabled || focusableElements.length === 0) return;

    switch (action) {
      case 'next': {
        const nextIndex = currentFocusIndex < focusableElements.length - 1 
          ? currentFocusIndex + 1 
          : 0;
        
        focusableElements[nextIndex]?.focus();
        setCurrentFocusIndex(nextIndex);
        break;
      }
      
      case 'previous': {
        const prevIndex = currentFocusIndex > 0 
          ? currentFocusIndex - 1 
          : focusableElements.length - 1;
        
        focusableElements[prevIndex]?.focus();
        setCurrentFocusIndex(prevIndex);
        break;
      }
      
      case 'submit': {
        if (currentFocusIndex >= 0 && currentFocusIndex < focusableElements.length) {
          const element = focusableElements[currentFocusIndex];
          element.click();
        }
        break;
      }
      
      case 'cancel': {
        // Remove focus from the current element
        (document.activeElement as HTMLElement)?.blur();
        setCurrentFocusIndex(-1);
        break;
      }
      
      // Other actions can be handled by the component using this hook
      default:
        break;
    }
  }, [currentFocusIndex, enabled, focusableElements]);

  // Handle keyboard events
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      // Skip if the user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        // Allow Escape key to work in input fields
        if (event.key !== 'Escape') {
          return;
        }
      }

      // Find matching shortcut
      const matchingShortcut = activeShortcuts.find(
        shortcut =>
          shortcut.key === event.key &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.shiftKey === event.shiftKey
      );

      if (matchingShortcut) {
        event.preventDefault();
        handleAction(matchingShortcut.action);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeShortcuts, enabled, handleAction]);

  // Register a new shortcut
  const registerShortcut = useCallback((shortcut: KeyboardShortcut): void => {
    setActiveShortcuts(prev => {
      // Remove any existing shortcut with the same key combination
      const filtered = prev.filter(
        s => 
          s.key !== shortcut.key || 
          s.ctrlKey !== shortcut.ctrlKey || 
          s.altKey !== shortcut.altKey || 
          s.shiftKey !== shortcut.shiftKey
      );
      
      return [...filtered, shortcut];
    });
  }, []);

  // Unregister a shortcut
  const unregisterShortcut = useCallback((key: string): void => {
    setActiveShortcuts(prev => prev.filter(s => s.key !== key));
  }, []);

  // Get the list of active shortcuts
  const getShortcutList = useCallback((): KeyboardShortcut[] => {
    return activeShortcuts;
  }, [activeShortcuts]);

  return {
    currentFocusIndex,
    focusableElements,
    handleAction,
    registerShortcut,
    unregisterShortcut,
    getShortcutList,
  };
} 