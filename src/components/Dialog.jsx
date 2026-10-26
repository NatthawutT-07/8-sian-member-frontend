import { useEffect, useRef } from 'react';

const focusableSelector =
  'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]';

export default function Dialog({
  children,
  titleId,
  label,
  className = '',
  onClose,
  busy = false,
  dismissOnBackdrop = false,
}) {
  const container = useRef(null);
  const close = useRef(onClose);
  const blocked = useRef(busy);
  close.current = onClose;
  blocked.current = busy;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = container.current;
    const elements = () =>
      Array.from(panel.querySelectorAll(focusableSelector)).filter(
        (element) => element.getClientRects().length > 0,
      );
    (elements()[0] || panel).focus({ preventScroll: true });

    function handleKey(event) {
      if (event.key === 'Escape' && !blocked.current && close.current) {
        event.preventDefault();
        close.current();
      }
      if (event.key !== 'Tab') return;
      const targets = elements();
      if (!targets.length) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = targets[0],
        last = targets.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first || !targets.includes(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !targets.includes(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }
    panel.addEventListener('keydown', handleKey);
    return () => {
      panel.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget && dismissOnBackdrop && !busy) onClose?.();
      }}
    >
      <section
        ref={container}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={label}
        tabIndex={-1}
        className={`modal ${className}`}
      >
        {children}
      </section>
    </div>
  );
}
