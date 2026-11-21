import { NextResponse } from 'next/server';

export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#161b22"/>
  <rect x="1" y="1" width="30" height="30" rx="7" fill="none" stroke="#30363d" stroke-width="2"/>
  <text x="6" y="22" font-family="monospace" font-size="16" font-weight="bold" fill="#7d8590">[</text>
  <circle cx="16" cy="16" r="3.5" fill="#2ea043"/>
  <text x="21" y="22" font-family="monospace" font-size="16" font-weight="bold" fill="#7d8590">]</text>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
