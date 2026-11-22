import { NextRequest, NextResponse } from 'next/server';
import { getSessionId, getSessionMetadata, SESSION_COOKIE_NAME } from '@/lib/session';
import { evaluateFlags } from '@/lib/flags';
import { extractTextFromPDF, analyzeResumeText } from '@/lib/resume';
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

    // 1. Extract text using PDF parser
    const { text, pageCount } = await extractTextFromPDF(buffer);

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        {
          error: {
            code: 'EMPTY_OR_SCANNED_PDF',
            message: 'Unable to extract text. Please ensure the PDF is not an image-only scan and contains selectable text.',
          },
        },
        { status: 422 }
      );
    }

    // 2. Perform section isolation & weak bullet diagnostic
    const analysis = analyzeResumeText(text, file.name, pageCount);

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
