import Link from 'next/link';
import { Fragment } from 'react';

/** Renders copy that may contain inline Markdown links `[text](/path)` and **bold**. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (link) {
          return (
            <Link key={i} href={link[2] ?? '/'} className="font-medium text-teal-700 underline decoration-teal-700/30 underline-offset-4 hover:text-teal-800 hover:decoration-teal-800">
              {link[1]}
            </Link>
          );
        }
        const bold = /^\*\*([^*]+)\*\*$/.exec(part);
        if (bold) return <strong key={i} className="font-semibold text-navy-900">{bold[1]}</strong>;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
