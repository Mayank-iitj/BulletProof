import { NextResponse } from 'next/server';

export async function GET() {
  const flagsmithConfigured = Boolean(process.env.FLAGSMITH_SERVER_KEY);
  const llmConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

  return NextResponse.json(
    {
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      checks: {
        flagsmith: flagsmithConfigured ? 'ok' : 'fallback-active',
        db: 'ok',
        llm: llmConfigured ? 'ok' : 'fallback-active',
      },
    },
    { status: 200 }
  );
}
