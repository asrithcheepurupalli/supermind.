// The studio mark. Same badge as the airlock and stash pages: quiet, mono,
// with the period in vermilion.
export default function MadeBadge({ className = '' }: { className?: string }) {
  return (
    <a
      href="https://made-by-ac.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`haptic inline-flex items-baseline gap-1.5 group ${className}`}
      title="More from made."
    >
      <span className="font-label text-[9px] text-ink-faint group-hover:text-ink-soft transition-colors">a</span>
      <span className="font-display text-base text-ink leading-none tracking-tight">
        made<span className="text-accent">.</span>
      </span>
      <span className="font-label text-[9px] text-ink-faint group-hover:text-ink-soft transition-colors">product</span>
    </a>
  );
}
