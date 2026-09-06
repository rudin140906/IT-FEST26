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
  speed = 100,
  pauseDelay = 2500,
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

  // Dynamic color formatter for retro multi-color typing
  const renderColoredText = (str: string) => {
    if (!str.startsWith("WELCOME")) {
      return <span>{str}</span>;
    }

    const part1 = str.slice(0, 7); // WELCOME
    const part2 = str.slice(7, 11); //  TO 
    const part3 = str.slice(11, 14); // IT-
    const part4 = str.slice(14, 22); // FESTIVAL
    const part5 = str.slice(22); //  2026

    return (
      <>
        {part1 && <span className="text-yellow">{part1}</span>}
        {part2 && <span className="text-cream">{part2}</span>}
        {part3 && <span className="text-pink">{part3}</span>}
        {part4 && <span className="text-cyan">{part4}</span>}
        {part5 && <span className="text-yellow">{part5}</span>}
      </>
    );
  };

  return (
    <span>
      {renderColoredText(displayed)}
      <span className="inline-block w-[4px] md:w-[6px] h-[0.9em] bg-yellow ml-1.5 animate-pulse align-middle" />
    </span>
  );
}