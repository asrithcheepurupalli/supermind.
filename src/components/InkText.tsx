import React from 'react';
import { hapticTap } from '../utils/haptics';

// The lightest possible rich text, parsed line by line with no dependencies:
//   - [ ] task        a checkbox you can tap right in the book
//   - [x] task        done, struck through
//   - point           a bullet
//   **bold** *italic* `code`
// Everything else renders as the plain ink it is. The source text stays
// untouched markdown, so exports and search see exactly what was written.

const INLINE_TOKEN = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g;

const renderInline = (text: string): React.ReactNode[] =>
  text.split(INLINE_TOKEN).filter(Boolean).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="font-label text-[0.72em] bg-paper-raised border border-[var(--ink-line)] rounded-[2px] px-1 py-0.5 align-middle">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });

const CHECKBOX = /^(\s*)- \[( |x)\] (.*)$/;
const BULLET = /^(\s*)[-*] (.+)$/;

interface InkTextProps {
  text: string;
  // Called with the line index whose checkbox was tapped. Absent = read-only.
  onToggleCheck?: (lineIndex: number) => void;
}

export default function InkText({ text, onToggleCheck }: InkTextProps) {
  const lines = text.split('\n');
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const check = line.match(CHECKBOX);
        if (check) {
          const done = check[2] === 'x';
          return (
            <div key={i} className="flex items-start gap-2.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!onToggleCheck) return;
                  hapticTap();
                  onToggleCheck(i);
                }}
                disabled={!onToggleCheck}
                aria-label={done ? 'Mark as not done' : 'Mark as done'}
                className={`mt-[0.42em] w-[15px] h-[15px] border-[1.5px] rounded-[2px] flex items-center justify-center flex-shrink-0 transition-colors ${
                  done ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--ink)] hover:border-[var(--accent)]'
                }`}
              >
                {done && (
                  <svg viewBox="0 0 12 12" className="w-2 h-2" fill="none">
                    <path d="M2 6.5L4.8 9L10 3" stroke="#fffdf7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className={done ? 'text-ink-faint line-through decoration-[var(--ink-line)]' : ''}>
                {renderInline(check[3])}
              </span>
            </div>
          );
        }
        const bullet = line.match(BULLET);
        if (bullet) {
          return (
            <div key={i} className="flex items-start gap-2.5">
              <span aria-hidden className="mt-[0.65em] w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
              <span>{renderInline(bullet[2])}</span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-2" />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}
