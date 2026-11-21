import React from 'react';

interface TextWithBadgesProps {
  text: string;
}

/**
 * Highlights bracketed metric placeholders like [X%], [N], [$Y]
 * with an interactive visual badge and helpful tooltip.
 */
export function HighlightedText({ text }: TextWithBadgesProps) {
  // Regex splitting by bracketed tokens [ ... ]
  const parts = text.split(/(\[[^\]]+\])/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          return (
            <span
              key={index}
              className="metric-badge cursor-help group relative"
              title="Replace this placeholder with your actual achievement metric"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
