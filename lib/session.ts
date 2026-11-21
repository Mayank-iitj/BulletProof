import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';

export const SESSION_COOKIE_NAME = 'bp_sid';

/**
 * Simple UUID v4 generator without external dependencies
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Retrieves the session ID from request cookies or generates a new one.
 * Accepts optional NextRequest to support direct invocation and route handlers.
 */
export async function getSessionId(req?: NextRequest): Promise<{ sessionId: string; isNew: boolean }> {
  if (req) {
    const cookie = req.cookies.get(SESSION_COOKIE_NAME);
    if (cookie && cookie.value) {
      return { sessionId: cookie.value, isNew: false };
    }
  }

  try {
    const cookieStore = await cookies();
    const existingCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (existingCookie && existingCookie.value) {
      return { sessionId: existingCookie.value, isNew: false };
    }
  } catch {
    // Graceful fallback if called outside Next.js request context
  }

  const newId = generateUUID();
  return { sessionId: newId, isNew: true };
}

/**
 * Extracts anonymous context metadata for Flagsmith traits and analytics
 */
export async function getSessionMetadata(req?: NextRequest) {
  let userAgent = '';
  let referer = '';

  if (req) {
    userAgent = req.headers.get('user-agent') || '';
    referer = req.headers.get('referer') || '';
  } else {
    try {
      const headersList = await headers();
      userAgent = headersList.get('user-agent') || '';
      referer = headersList.get('referer') || '';
    } catch {
      // Fallback
    }
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  let source = 'direct';

  try {
    if (referer) {
      const url = new URL(referer);
      const utmSource = url.searchParams.get('utm_source');
      if (utmSource) {
        source = utmSource;
      } else if (url.hostname.includes('discord')) {
        source = 'discord';
      } else if (url.hostname.includes('linkedin')) {
        source = 'linkedin';
      } else if (url.hostname.includes('twitter') || url.hostname.includes('x.com')) {
        source = 'x';
      } else if (url.hostname.includes('reddit')) {
        source = 'reddit';
      } else {
        source = url.hostname;
      }
    }
  } catch {
    // Keep direct
  }

  return {
    device: isMobile ? 'mobile' : 'desktop',
    source,
  };
}
