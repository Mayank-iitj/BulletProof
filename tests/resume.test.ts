import { describe, it, expect } from 'vitest';
import { analyzeResumeText, extractTextFromPDF } from '../lib/resume';
import zlib from 'zlib';

const SAMPLE_RESUME_TEXT = `
Mayank Sharma
Senior Software Engineer
mayank@example.com | (555) 123-4567

EXPERIENCE
Acme Cloud Technologies | Backend Engineer | 2022 - Present
• Worked on backend of project
• Responsible for customer support tickets and resolving issues
• Boosted API throughput by 42% by designing distributed Redis caching tier in Go
• Assisted in code reviews and debugging database queries

TECHNICAL PROJECTS
Distributed Task Queue | Personal Project | 2023
• Built a task execution engine in Node.js
• Reduced execution latency by 35% across 10,000 daily jobs

EDUCATION
B.Tech in Computer Science | 2022

SKILLS
Go, TypeScript, PostgreSQL, Docker, AWS
`;

describe('PDF Resume Extraction & Diagnostic Engine', () => {
  it('identifies Experience and Project sections accurately', () => {
    const analysis = analyzeResumeText(SAMPLE_RESUME_TEXT, 'mayank_resume.pdf', 1);

    expect(analysis.sectionsFound).toContain('Experience');
    expect(analysis.sectionsFound).toContain('Projects');
    expect(analysis.totalBullets).toBeGreaterThanOrEqual(4);
  });

  it('detects weak and passive bullets as critical/warning', () => {
    const analysis = analyzeResumeText(SAMPLE_RESUME_TEXT, 'mayank_resume.pdf', 1);

    const weakBullet = analysis.bullets.find((b) => b.rawText.includes('Worked on backend of project'));
    expect(weakBullet).toBeDefined();
    expect(weakBullet?.severity).toBe('critical');
    expect(weakBullet?.issue).toContain('zero quantified outcome');

    const passiveBullet = analysis.bullets.find((b) => b.rawText.includes('Responsible for customer support'));
    expect(passiveBullet).toBeDefined();
    expect(passiveBullet?.severity).toBe('critical');
  });

  it('recognizes quantified impact bullets as well-formed', () => {
    const analysis = analyzeResumeText(SAMPLE_RESUME_TEXT, 'mayank_resume.pdf', 1);

    const metricBullet = analysis.bullets.find((b) => b.rawText.includes('Boosted API throughput by 42%'));
    expect(metricBullet).toBeDefined();
    expect(metricBullet?.severity).toBe('good');
  });

  it('detects candidate role based on technical content', () => {
    const analysis = analyzeResumeText(SAMPLE_RESUME_TEXT, 'mayank_resume.pdf', 1);
    expect(analysis.detectedRole).toBe('Backend Engineer');
  });

  it('computes an overall health score between 15 and 95', () => {
    const analysis = analyzeResumeText(SAMPLE_RESUME_TEXT, 'mayank_resume.pdf', 1);
    expect(analysis.overallScore).toBeGreaterThanOrEqual(15);
    expect(analysis.overallScore).toBeLessThanOrEqual(95);
  });

  it('extracts text from simulated compressed FlateDecode PDF stream', async () => {
    // Generate a simulated minimal PDF with compressed stream
    const content = '(Mayank Sharma) Tj\n[(Engineered distributed backend)] TJ';
    const compressed = zlib.deflateSync(Buffer.from(content, 'utf-8'));
    const pdfRaw = `%PDF-1.4\nstream\n${compressed.toString('latin1')}\nendstream\n%%EOF`;
    const pdfBuffer = Buffer.from(pdfRaw, 'latin1');

    const result = await extractTextFromPDF(pdfBuffer);
    expect(result.text).toContain('Mayank Sharma');
    expect(result.text).toContain('Engineered distributed backend');
  });
});
