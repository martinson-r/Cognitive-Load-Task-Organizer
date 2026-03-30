import { useEffect } from 'react';

export function useFocusTrap(ref, isActive = true) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const el = ref.current;
    // Query string updated to explicitly reject disabled elements right away
    const focusableSelectors = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const previousFocus = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      // 1. Grab all theoretically focusable elements
      const nodes = el.querySelectorAll(focusableSelectors);
      
      // 2. Filter out elements that are visually hidden (like your file input)
      const focusableElements = Array.from(nodes).filter(
        (node) => node.offsetWidth > 0 || node.offsetHeight > 0 || node.getClientRects().length > 0
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Fail-safe: If focus somehow escapes the modal (e.g., clicking the backdrop),
      // force it back to the first element on the next Tab press.
      if (!el.contains(document.activeElement)) {
        firstElement.focus();
        e.preventDefault();
        return;
      }

      if (e.shiftKey) {
        // Shift + Tab: loop from first to last
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab: loop from last to first
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    el.addEventListener('keydown', handleKeyDown);

    return () => {
      el.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the trigger button when the modal closes
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    };
  }, [ref, isActive]);
}