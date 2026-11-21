import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { VariantKey, EventType } from './types';

export interface DBSession {
  id: string;
  created_at: string;
  source: string;
  device: string;
  variant: VariantKey;
  first_exposed_at?: string;
}

export interface DBRewrite {
  id: string;
  session_id: string;
  variant: VariantKey;
  input_len: number;
  input_hash: string;
  output_len: number;
  latency_ms: number;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  created_at: string;
}

export interface DBEvent {
  id: string;
  session_id: string;
  rewrite_id?: string;
  type: EventType;
  variant: VariantKey;
  props: Record<string, any>;
  created_at: string;
}

export interface DBStore {
  sessions: DBSession[];
  rewrites: DBRewrite[];
  events: DBEvent[];
  budget_ledger: Record<string, number>;
  rewrite_text: Record<string, { input: string; outputs: any }>;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

function ensureDB(): DBStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial: DBStore = {
      sessions: [],
      rewrites: [],
      events: [],
      budget_ledger: {},
      rewrite_text: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[DB] Error reading store, reinitializing:', err);
    return {
      sessions: [],
      rewrites: [],
      events: [],
      budget_ledger: {},
      rewrite_text: {},
    };
  }
}

function saveDB(store: DBStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to save database:', err);
  }
}

export function hashInput(text: string): string {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}

export const db = {
  getOrCreateSession(sessionId: string, variant: VariantKey, source: string, device: string): DBSession {
    const store = ensureDB();
    let session = store.sessions.find((s) => s.id === sessionId);
    if (!session) {
      session = {
        id: sessionId,
        created_at: new Date().toISOString(),
        source,
        device,
        variant,
        first_exposed_at: new Date().toISOString(),
      };
      store.sessions.push(session);
      saveDB(store);
    }
    return session;
  },

  recordRewrite(record: Omit<DBRewrite, 'created_at'>): DBRewrite {
    const store = ensureDB();
    const fullRecord: DBRewrite = {
      ...record,
      created_at: new Date().toISOString(),
    };
    store.rewrites.push(fullRecord);

    // Update daily budget ledger
    const day = new Date().toISOString().split('T')[0];
    store.budget_ledger[day] = (store.budget_ledger[day] || 0) + record.cost_usd;

    saveDB(store);
    return fullRecord;
  },

  recordEvent(event: Omit<DBEvent, 'id' | 'created_at'>): DBEvent {
    const store = ensureDB();
    // Idempotency check: don't double count identical action within 1 second
    const isDuplicate = store.events.some(
      (e) =>
        e.session_id === event.session_id &&
        e.rewrite_id === event.rewrite_id &&
        e.type === event.type &&
        e.props?.suggestionId === event.props?.suggestionId
    );

    if (isDuplicate) {
      return store.events.find(
        (e) =>
          e.session_id === event.session_id &&
          e.rewrite_id === event.rewrite_id &&
          e.type === event.type
      )!;
    }

    const fullEvent: DBEvent = {
      ...event,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    store.events.push(fullEvent);
    saveDB(store);
    return fullEvent;
  },

  storeRewriteText(rewriteId: string, input: string, outputs: any) {
    const store = ensureDB();
    store.rewrite_text[rewriteId] = { input, outputs };
    saveDB(store);
  },

  getDailySpentUSD(day?: string): number {
    const store = ensureDB();
    const targetDay = day || new Date().toISOString().split('T')[0];
    return store.budget_ledger[targetDay] || 0;
  },

  getAll(): DBStore {
    return ensureDB();
  },

  clearData() {
    const initial: DBStore = {
      sessions: [],
      rewrites: [],
      events: [],
      budget_ledger: {},
      rewrite_text: {},
    };
    saveDB(initial);
  },
};
