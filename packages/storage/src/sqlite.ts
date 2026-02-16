import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "node:path";
import fs from "node:fs";
import type {
  StoredEmail,
  EmailSummary,
  ListOptions,
  PaginatedResult,
  StorageStats,
} from "@resend-gateway/types";
import type { IStorageAdapter } from "./interface.js";

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS emails (
    id TEXT PRIMARY KEY,
    direction TEXT NOT NULL CHECK(direction IN ('inbound', 'outbound')),
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT '',
    html TEXT,
    text TEXT,
    reply_to TEXT,
    resend_id TEXT,
    headers TEXT,
    attachments TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_emails_direction ON emails(direction)`,
  `CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at DESC)`,
];

// Additive migration: add attachments column if table already exists without it
const ADDITIVE_MIGRATIONS = [
  {
    check: `SELECT COUNT(*) as cnt FROM pragma_table_info('emails') WHERE name='attachments'`,
    sql: `ALTER TABLE emails ADD COLUMN attachments TEXT`,
  },
];

interface EmailRow {
  id: string;
  direction: string;
  from: string;
  to: string;
  subject: string;
  html: string | null;
  text: string | null;
  reply_to: string | null;
  resend_id: string | null;
  headers: string | null;
  attachments: string | null;
  created_at: string;
}

export class SqliteAdapter implements IStorageAdapter {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor(dbPath: string = "./data/emails.db") {
    this.dbPath = dbPath;
  }

  async init(): Promise<void> {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(this.dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");

    for (const migration of MIGRATIONS) {
      this.db.exec(migration);
    }

    // Run additive migrations for existing databases
    for (const { check, sql } of ADDITIVE_MIGRATIONS) {
      const row = this.db.prepare(check).get() as { cnt: number };
      if (row.cnt === 0) {
        this.db.exec(sql);
      }
    }
  }

  private getDb(): Database.Database {
    if (!this.db) {
      throw new Error("Storage not initialized. Call init() first.");
    }
    return this.db;
  }

  async saveEmail(email: StoredEmail): Promise<string> {
    const db = this.getDb();
    const id = email.id || uuidv4();
    const toValue = Array.isArray(email.to) ? JSON.stringify(email.to) : email.to;
    const headersValue = email.headers ? JSON.stringify(email.headers) : null;
    const attachmentsValue = email.attachments?.length
      ? JSON.stringify(email.attachments)
      : null;

    db.prepare(
      `INSERT INTO emails (id, direction, "from", "to", subject, html, text, reply_to, resend_id, headers, attachments, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      email.direction,
      email.from,
      toValue,
      email.subject,
      email.html ?? null,
      email.text ?? null,
      email.replyTo ?? null,
      email.resendId ?? null,
      headersValue,
      attachmentsValue,
      email.createdAt,
    );

    return id;
  }

  async listEmails(opts: ListOptions): Promise<PaginatedResult<EmailSummary>> {
    const db = this.getDb();
    const { page, limit, direction, search } = opts;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (direction && direction !== "all") {
      conditions.push("direction = ?");
      params.push(direction);
    }

    if (search) {
      conditions.push('(subject LIKE ? OR "from" LIKE ? OR "to" LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countRow = db
      .prepare(`SELECT COUNT(*) as count FROM emails ${whereClause}`)
      .get(...params) as { count: number };

    const total = countRow.count;
    const totalPages = Math.ceil(total / limit);

    const rows = db
      .prepare(
        `SELECT id, direction, "from", "to", subject, text, attachments, created_at
         FROM emails ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset) as EmailRow[];

    const items: EmailSummary[] = rows.map((row) => {
      const attachments = row.attachments ? tryParseJson(row.attachments) : null;
      const attachmentCount = Array.isArray(attachments) ? attachments.length : 0;

      return {
        id: row.id,
        direction: row.direction as "inbound" | "outbound",
        from: row.from,
        to: tryParseJson(row.to) as string | string[],
        subject: row.subject,
        createdAt: row.created_at,
        snippet: row.text ? row.text.slice(0, 120) : undefined,
        attachmentCount: attachmentCount > 0 ? attachmentCount : undefined,
      };
    });

    return { items, total, page, limit, totalPages };
  }

  async getEmailById(id: string): Promise<StoredEmail | null> {
    const db = this.getDb();

    const row = db
      .prepare(
        `SELECT id, direction, "from", "to", subject, html, text, reply_to, resend_id, headers, attachments, created_at
         FROM emails WHERE id = ?`
      )
      .get(id) as EmailRow | undefined;

    if (!row) return null;

    const attachments = row.attachments ? JSON.parse(row.attachments) : undefined;

    return {
      id: row.id,
      direction: row.direction as "inbound" | "outbound",
      from: row.from,
      to: tryParseJson(row.to) as string | string[],
      subject: row.subject,
      html: row.html ?? undefined,
      text: row.text ?? undefined,
      replyTo: row.reply_to ?? undefined,
      resendId: row.resend_id ?? undefined,
      headers: row.headers ? JSON.parse(row.headers) : undefined,
      attachments: Array.isArray(attachments) && attachments.length > 0 ? attachments : undefined,
      createdAt: row.created_at,
    };
  }

  async deleteEmail(id: string): Promise<boolean> {
    const db = this.getDb();
    const result = db.prepare("DELETE FROM emails WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async getStats(): Promise<StorageStats> {
    const db = this.getDb();

    const total = (
      db.prepare("SELECT COUNT(*) as count FROM emails").get() as { count: number }
    ).count;

    const inbound = (
      db
        .prepare("SELECT COUNT(*) as count FROM emails WHERE direction = 'inbound'")
        .get() as { count: number }
    ).count;

    const outbound = (
      db
        .prepare("SELECT COUNT(*) as count FROM emails WHERE direction = 'outbound'")
        .get() as { count: number }
    ).count;

    return { totalEmails: total, inboundCount: inbound, outboundCount: outbound };
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
