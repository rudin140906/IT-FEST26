interface MarqueeProps {
  items: string[];
  className?: string;
}

export default function Marquee({ items, className = "" }: MarqueeProps) {
  return (
    <div
      className={`overflow-hidden border-y-3 border-ink bg-yellow py-2 -rotate-1 ${className}`}
    >
      <div className="flex w-max animate-marquee gap-10">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="font-pixel text-[10px] text-ink whitespace-nowrap flex items-center gap-10"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}