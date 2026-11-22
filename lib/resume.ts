import { extractText } from 'unpdf';

export interface ExtractedBullet {
  id: string;
  rawText: string;
  section: string;
  severity: 'critical' | 'warning' | 'good';
  issue: string;
  recommendation: string;
}

export interface ScannedResume {
  fileName: string;
  pageCount: number;
  detectedName?: string;
  detectedRole?: string;
  sectionsFound: string[];
  overallScore: number; // 0 - 100
  totalBullets: number;
  bullets: ExtractedBullet[];
  summary: {
    criticalCount: number;
    warningCount: number;
    goodCount: number;
  };
}

const WEAK_OPENERS = [
  'responsible for',
  'helped with',
  'helped in',
  'worked on',
  'assisted in',
  'assisted with',
  'handled',
  'did',
  'made',
  'tasked with',
  'part of a team that',
  'involved in',
  'contributed to',
  'supported',
];

const METRIC_INDICATORS = [
  /\b\d+\s*%/,
  /\b\d+\s*x\b/i,
  /\$\s*\d+/,
  /\b\d+\s*(?:k|m|b|ms|sec|seconds|minutes|hours|days|users|clients|requests|qps|endpoints|engineers|developers|repos)\b/i,
  /\b(?:increased|decreased|reduced|boosted|accelerated|improved|saved|scaled)\s+by\b/i,
];

const SECTION_HEADERS: Record<string, RegExp> = {
  Experience: /^(?:professional\s+|work\s+|industry\s+)?experience|employment(?:\s+history)?|work\s+history/i,
  Projects: /^(?:technical\s+|academic\s+|personal\s+|key\s+)?projects|portfolio/i,
  Leadership: /^(?:leadership|extracurricular(?:\s+activities)?|volunteer(?:\s+work)?)/i,
  Education: /^education|academic\s+background/i,
  Skills: /^(?:technical\s+)?skills|technologies|proficiencies/i,
};

/**
 * Parses raw text from a PDF Buffer with primary unpdf extraction and resilient regex fallback
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  try {
    const res = await extractText(buffer);
    const combinedText = Array.isArray(res.text) ? res.text.join('\n') : (res.text || '');
    const pageCount = res.totalPages || 1;

    if (combinedText.trim().length > 0) {
      return { text: combinedText, pageCount };
    }
  } catch (err) {
    console.warn('[extractTextFromPDF] unpdf primary extraction encountered error, attempting fallback:', err);
  }

  // Resilient fallback for raw uncompressed PDF streams
  try {
    const raw = buffer.toString('latin1');
    const matches: string[] = [];
    const tjRegex = /\(([^()]+)\)\s*Tj/g;
    let match: RegExpExecArray | null;
    while ((match = tjRegex.exec(raw)) !== null) {
      matches.push(match[1]);
    }

    if (matches.length > 0) {
      return { text: matches.join(' '), pageCount: 1 };
    }
  } catch {
    // Ignore fallback error
  }

  return { text: '', pageCount: 1 };
}

/**
 * Analyzes resume text, detects sections, and isolates weak bullets for BulletProof optimization
 */
export function analyzeResumeText(rawText: string, fileName = 'resume.pdf', pageCount = 1): ScannedResume {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let currentSection = 'General';
  const sectionsFound = new Set<string>();
  const rawBullets: Array<{ text: string; section: string }> = [];

  // 1. Scan lines and group into sections
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section header
    let matchedSection: string | null = null;
    for (const [secName, regex] of Object.entries(SECTION_HEADERS)) {
      if (regex.test(line) && line.length < 40) {
        matchedSection = secName;
        break;
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
      sectionsFound.add(matchedSection);
      continue;
    }

    // Only look for bullets in Experience, Projects, Leadership, or General
    if (['Education', 'Skills'].includes(currentSection)) {
      continue;
    }

    // Detect bullet points: lines starting with bullet symbol or action verb
    const isBulletSymbol = /^[\u2022\u2023\u25E6\u2043\u2219\*\-\–\—\>]\s*/.test(line);
    const cleanedText = line.replace(/^[\u2022\u2023\u25E6\u2043\u2219\*\-\–\—\>]\s*/, '').trim();

    // Filter out subtitle tech stack tags (e.g. "Supervised Learning, Data Analysis", "NLP, Machine Learning")
    const isTechSubtitle =
      !isBulletSymbol &&
      cleanedText.includes(',') &&
      cleanedText.split(/\s+/).length <= 6 &&
      !/[.!?]$/.test(cleanedText) &&
      !/\b(?:by|with|using|across|from|into|for|to)\b/i.test(cleanedText);

    if (isTechSubtitle) {
      continue;
    }

    if (cleanedText.length >= 15 && cleanedText.length <= 400) {
      if (isBulletSymbol) {
        rawBullets.push({ text: cleanedText, section: currentSection });
      } else if (
        // Non-symbol bullet heuristic: starts with uppercase and contains past-tense or active verb
        /^[A-Z][a-z]+(?:ed|ing|ted|ced|sed|red|ved)\b/.test(cleanedText) ||
        WEAK_OPENERS.some((w) => cleanedText.toLowerCase().startsWith(w))
      ) {
        // If length fits typical resume bullet and does not look like a date/company line
        if (!/^(?:19|20)\d{2}|^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(cleanedText)) {
          rawBullets.push({ text: cleanedText, section: currentSection });
        }
      }
    }
  }

  // Fallback: If no bullets parsed due to unusual formatting, split into sentences
  if (rawBullets.length === 0) {
    const sentences = rawText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 20 && s.length <= 300);

    for (const s of sentences.slice(0, 10)) {
      rawBullets.push({ text: s, section: 'Experience' });
    }
  }

  // 2. Classify and diagnose each bullet
  const bullets: ExtractedBullet[] = [];
  let criticalCount = 0;
  let warningCount = 0;
  let goodCount = 0;

  for (let idx = 0; idx < rawBullets.length; idx++) {
    const item = rawBullets[idx];
    const textLower = item.text.toLowerCase();

    const hasWeakOpener = WEAK_OPENERS.some((w) => textLower.startsWith(w));
    const hasMetric = METRIC_INDICATORS.some((re) => re.test(item.text));
    const isTooShort = item.text.split(/\s+/).length < 8;

    let severity: 'critical' | 'warning' | 'good' = 'good';
    let issue = 'Strong bullet with active framing';
    let recommendation = 'Well-formed. Can still be tested against Team Impact for lift.';

    if (hasWeakOpener && !hasMetric) {
      severity = 'critical';
      issue = 'Passive opener & zero quantified outcome';
      recommendation = 'Rewrite with strong action verb + metric: Action + Context + [X%] Result.';
      criticalCount++;
    } else if (hasWeakOpener) {
      severity = 'critical';
      issue = 'Starts with weak or passive opener';
      recommendation = 'Replace passive opener (e.g. "Worked on") with an engineering verb (e.g. "Architected").';
      criticalCount++;
    } else if (!hasMetric) {
      severity = 'warning';
      issue = 'Active framing, but missing quantifiable metrics';
      recommendation = 'Add quantifiable scale: users served, % latency drop, or time saved.';
      warningCount++;
    } else if (isTooShort) {
      severity = 'warning';
      issue = 'Under-specified technical scope';
      recommendation = 'Expand context with technical stack and deployment scale.';
      warningCount++;
    } else {
      goodCount++;
    }

    bullets.push({
      id: `rb_${idx + 1}`,
      rawText: item.text,
      section: item.section,
      severity,
      issue,
      recommendation,
    });
  }

  // Sort bullets so critical issues appear first
  bullets.sort((a, b) => {
    const order = { critical: 0, warning: 1, good: 2 };
    return order[a.severity] - order[b.severity];
  });

  // Calculate overall score (0-100)
  const total = bullets.length || 1;
  const rawScore = Math.round(
    ((goodCount * 1.0 + warningCount * 0.5 + criticalCount * 0.1) / total) * 100
  );
  const overallScore = Math.max(15, Math.min(95, rawScore));

  // Keyword scoring for role detection
  const roleScores: Record<string, number> = {
    'AI & Data Engineer': 0,
    'Backend Engineer': 0,
    'Frontend Developer': 0,
    'Product Manager': 0,
    'Data Scientist': 0,
  };

  const lower = rawText.toLowerCase();
  const testKeywords = (words: string[]) => words.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);

  roleScores['AI & Data Engineer'] = testKeywords([
    'ai & data engineering',
    'machine learning',
    'data analytics',
    'computer vision',
    'nlp',
    'predictive models',
    'streamlit',
    'statistical modeling',
    'data science',
    'feature engineering',
  ]);
  roleScores['Backend Engineer'] = testKeywords(['backend', 'microservices', 'distributed', 'redis', 'database', 'postgres', 'golang', 'api throughput', 'sql']);
  roleScores['Frontend Developer'] = testKeywords(['frontend', 'react', 'next.js', 'tailwindcss', 'css3', 'redux', 'ui components', 'responsive design']);
  roleScores['Product Manager'] = testKeywords(['product manager', 'roadmap', 'kpis', 'stakeholder', 'user research', 'prds']);
  roleScores['Data Scientist'] = testKeywords(['data scientist', 'deep learning', 'pandas', 'numpy', 'pytorch', 'tensorflow']);

  let detectedRole = 'Backend Engineer';
  let maxScore = 0;
  for (const [r, score] of Object.entries(roleScores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedRole = r;
    }
  }

  return {
    fileName,
    pageCount,
    detectedRole,
    sectionsFound: Array.from(sectionsFound),
    overallScore,
    totalBullets: bullets.length,
    bullets,
    summary: {
      criticalCount,
      warningCount,
      goodCount,
    },
  };
}
