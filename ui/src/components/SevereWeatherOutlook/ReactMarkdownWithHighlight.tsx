'use client';

import { useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

type Props = {
  markdown: string;
  quotes?: string[];
  keywords?: string[];
  className?: string;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightKeywords(text: string, keywords: string[]): string {
  if (!keywords.length) return text;

  return keywords.reduce((acc, keyword) => {
    if (!keyword) return acc;
    const pattern = new RegExp(`(${escapeRegex(keyword)})`, 'gi');
    return acc.replace(
      pattern,
      '<mark class="bg-yellow-200 rounded-sm">$1</mark>',
    );
  }, text);
}

function applyHighlights(
  markdown: string,
  quotes: string[],
  keywords: string[],
): string {
  // If no quotes, just highlight keywords across the text
  if (!quotes.length) {
    return highlightKeywords(markdown, keywords);
  }

  // Replace only the first occurrence of each quote with black text and keyword highlighting
  let result = markdown;
  quotes.forEach((quote) => {
    if (!quote) return;
    const highlightedQuote = `<span class="text-black">${highlightKeywords(
      quote,
      keywords,
    )}</span>`;
    const pattern = new RegExp(escapeRegex(quote), 'i');
    result = result.replace(pattern, highlightedQuote);
  });

  return result;
}

export function ReactMarkdownWithHighlight({
  markdown,
  quotes = [],
  keywords = [],
}: Props) {
  const content = useMemo(
    () => applyHighlights(markdown, quotes, keywords),
    [markdown, quotes, keywords],
  );

  const containerClass = [quotes.length ? 'text-gray-400' : '']
    .filter(Boolean)
    .join(' ');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (containerRef.current && quotes.length > 0) {
        const mark = containerRef.current.querySelector('mark');
        if (mark) {
          mark.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        }
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [content, quotes]);

  return (
    <div
      ref={containerRef}
      className={containerClass}
      style={{ whiteSpace: 'pre-line' }}
    >
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
    </div>
  );
}
