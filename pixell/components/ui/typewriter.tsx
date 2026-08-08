"use client";

import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  pauseDelay?: number;
  loop?: boolean;
}

export default function Typewriter({
  text,
  speed = 90,
  pauseDelay = 2000,
  loop = true,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayed.length < text.length) {
      // Type next character
      timeout = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1));
      }, speed);
    } else if (!isDeleting && displayed.length === text.length) {
      if (loop) {
        // Pause at full text before deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDelay);
      }
    } else if (isDeleting && displayed.length > 0) {
      // Erase character by character
      timeout = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length - 1));
      }, speed / 2);
    } else if (isDeleting && displayed.length === 0) {
      // Finished deleting, start typing again
      setIsDeleting(false);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, text, speed, pauseDelay, loop]);

  return (
    <span>
      {displayed}
      <span className="inline-block w-[3px] md:w-[4px] h-[0.9em] bg-yellow ml-1 animate-pulse align-middle" />
    </span>
  );
}