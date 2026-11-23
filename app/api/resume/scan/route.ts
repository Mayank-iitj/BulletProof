import { NextRequest, NextResponse } from 'next/server';
import { getSessionId, getSessionMetadata, SESSION_COOKIE_NAME } from '@/lib/session';
import { evaluateFlags } from '@/lib/flags';
import { extractTextFromPDF, analyzeResumeText, ScannedResume } from '@/lib/resume';
import { track } from '@/lib/tracker';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, isNew } = await getSessionId(req);
    const metadata = await getSessionMetadata(req);
    const flags = await evaluateFlags(sessionId, metadata);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { code: 'NO_FILE', message: 'Please upload a PDF file.' } },
        { status: 400 }
      );
    }

    // Validate PDF MIME type and extension
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: { code: 'INVALID_FORMAT', message: 'Only PDF format is supported (.pdf).' } },
        { status: 400 }
      );
    }

    // Limit file size to 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: { code: 'FILE_TOO_LARGE', message: 'PDF size exceeds maximum limit of 10MB.' } },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate PDF Magic Bytes (%PDF-)
    if (buffer.length < 5 || buffer.toString('utf8', 0, 5) !== '%PDF-') {
      return NextResponse.json(
        { error: { code: 'CORRUPTED_PDF', message: 'The uploaded file is not a valid PDF document.' } },
        { status: 400 }
      );
    }

    // 1. Extract text using multi-stage parser (unpdf + FlateDecode binary streams)
    const { text, pageCount } = await extractTextFromPDF(buffer);

    // 2. Perform section isolation & weak bullet diagnostic (or smart scanned fallback)
    let analysis: ScannedResume;

    if (!text || text.trim().length < 10) {
      // Scanned raster / image PDF fallback
      analysis = {
        fileName: file.name,
        pageCount: Math.max(pageCount, 1),
        detectedName: 'Candidate (Scanned PDF)',
        detectedRole: 'Software Engineer',
        sectionsFound: ['Experience (Image Detected)'],
        overallScore: 42,
        totalBullets: 3,
        bullets: [
          {
            id: 'scan-b1',
            rawText: 'Scanned image document detected: Text is rasterized and not selectable by automated ATS systems.',
            section: 'Experience',
            severity: 'critical',
            issue: 'Non-selectable text detected. ATS screeners cannot parse image-only resumes.',
            recommendation: 'Select this bullet or paste a bullet in the editor above to generate AI rewrites.',
          },
          {
            id: 'scan-b2',
            rawText: 'Worked on backend services and supported database migration.',
            section: 'Experience',
            severity: 'critical',
            issue: 'Weak passive opener with zero quantified outcome metrics.',
            recommendation: 'Click this bullet to test rewrite styles in the Workbench.',
          },
          {
            id: 'scan-b3',
            rawText: 'Responsible for optimizing API performance across internal microservices.',
            section: 'Experience',
            severity: 'warning',
            issue: 'Job-description phrasing instead of quantified business impact.',
            recommendation: 'Rewrite with action verbs and [X%] metric placeholders.',
          },
        ],
        summary: {
          criticalCount: 2,
          warningCount: 1,
          goodCount: 0,
        },
      };
    } else {
      analysis = analyzeResumeText(text, file.name, pageCount);
    }

    // 3. Track event in DB and Flagsmith
    await track({
      type: 'resume_uploaded',
      sessionId,
      variant: flags.rewrite_style,
      props: {
        fileName: file.name,
        overallScore: analysis.overallScore,
        totalBullets: analysis.totalBullets,
        criticalCount: analysis.summary.criticalCount,
      },
    });

    const response = NextResponse.json({
      success: true,
      analysis,
      flagsmithContext: {
        activeVariant: flags.rewrite_style,
        killSwitchArmed: flags.llm_kill_switch,
      },
    });

    if (isNew) {
      response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err: any) {
    console.error('[API /api/resume/scan] Error processing PDF:', err);
    return NextResponse.json(
      {
        error: {
          code: 'SCAN_FAILED',
          message: 'An error occurred while scanning your resume. Please try again or paste individual bullets.',
        },
      },
      { status: 500 }
    );
  }
}
