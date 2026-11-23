import { Flagsmith } from '@flagsmith/nodejs';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Helper to load .env.local if present
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.trim().match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv();

const environmentKey =
  process.env.FLAGSMITH_SERVER_KEY ||
  process.env.FLAGSMITH_ENVIRONMENT_KEY ||
  'erNxryCQZ9zHZ8E6YZwXhm';
const apiUrl = process.env.FLAGSMITH_API_URL || 'https://edge.api.flagsmith.com/api/v1/';

async function simulateTraffic(userCount = 150) {
  console.log(`[Simulation] Initializing Flagsmith Node SDK with events enabled...`);
  console.log(`[Simulation] Environment Key: ${environmentKey.slice(0, 6)}...`);
  console.log(`[Simulation] Target: ${userCount} simulated users`);

  const flagsmith = new Flagsmith({
    environmentKey,
    apiUrl,
    enableEvents: true,
    requestTimeoutSeconds: 10,
  });

  const variantsCount: Record<string, number> = { concise: 0, impact: 0, story: 0, other: 0 };
  const conversionsCount: Record<string, number> = { concise: 0, impact: 0, story: 0, other: 0 };

  console.log(`[Simulation] Starting traffic simulation...`);

  for (let i = 0; i < userCount; i++) {
    const identifier = `sim_user_${crypto.randomUUID()}`;
    const traits = {
      device: Math.random() < 0.6 ? 'mobile' : 'desktop',
      source: ['google', 'linkedin', 'twitter', 'direct'][Math.floor(Math.random() * 4)],
    };

    try {
      // 1. Get experiment flag (records exposure automatically)
      const flag = await flagsmith.getExperimentFlag('rewrite_style', identifier, traits);
      const variant = (flag?.value as string) || 'concise';

      if (variantsCount[variant] !== undefined) {
        variantsCount[variant]++;
      } else {
        variantsCount.other++;
      }

      // 2. Realistic conversion probability per variant
      // Impact slightly higher to demonstrate statistical significance
      let conversionRate = 0.33;
      if (variant === 'impact') conversionRate = 0.46;
      else if (variant === 'story') conversionRate = 0.31;
      else if (variant === 'concise') conversionRate = 0.32;

      const converted = Math.random() < conversionRate;
      if (converted) {
        // Track the metric event ('bullet_copied')
        flagsmith.trackEvent('bullet_copied', {
          identifier,
          metadata: { variant },
        });

        if (conversionsCount[variant] !== undefined) {
          conversionsCount[variant]++;
        } else {
          conversionsCount.other++;
        }
      }

      if ((i + 1) % 25 === 0 || i + 1 === userCount) {
        console.log(`[Simulation] Processed ${i + 1}/${userCount} users...`);
      }
    } catch (err: any) {
      console.warn(`[Simulation] Error for user ${identifier}:`, err?.message || err);
    }
  }

  console.log('\n--- Simulation Summary ---');
  console.log('Exposures:', variantsCount);
  console.log('Conversions (bullet_copied):', conversionsCount);
  console.log('Conversion Rates:', {
    concise: variantsCount.concise ? `${((conversionsCount.concise / variantsCount.concise) * 100).toFixed(1)}%` : '0%',
    impact: variantsCount.impact ? `${((conversionsCount.impact / variantsCount.impact) * 100).toFixed(1)}%` : '0%',
    story: variantsCount.story ? `${((conversionsCount.story / variantsCount.story) * 100).toFixed(1)}%` : '0%',
  });

  console.log('\n[Simulation] Flushing buffered events and closing Flagsmith client...');
  await flagsmith.close();
  console.log('[Simulation] All events flushed and client closed cleanly.');
}

simulateTraffic(150).catch((err) => {
  console.error('[Simulation] Fatal error:', err);
  process.exit(1);
});
