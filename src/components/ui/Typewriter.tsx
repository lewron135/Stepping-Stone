import React, { useEffect, useState } from 'react';

interface TypewriterProps {
  /** Text to type out. Use "\n" for a line break. */
  text: string;
  /** Milliseconds per character. */
  speed?: number;
  /** Delay before typing starts, in ms. */
  startDelay?: number;
  /** Whether to keep a blinking cursor after typing finishes. */
  showCursorAfter?: boolean;
  className?: string;
}

export function Typewriter({
  text,
  speed = 45,
  startDelay = 0,
  showCursorAfter = false,
  className,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let interval: ReturnType<typeof setInterval>;

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  const lines = displayed.split('\n');

  return (
    <span className={className}>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
      {(!done || showCursorAfter) && (
        <span className="ml-1 inline-block w-[0.06em] animate-pulse bg-current align-middle h-[0.85em]" />
      )}
    </span>
  );
}
