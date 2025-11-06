import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type LogEntry = {
  level: string;
  message: string;
  meta?: any;
  created_at: Date;
};

const logQueue: LogEntry[] = [];
const FLUSH_INTERVAL = 5000; 
const MAX_QUEUE_SIZE = 100;

export function dbLog(level: string, message: string, meta: any = {}) {
  logQueue.push({ level, message, meta, created_at: new Date() });
  if (logQueue.length >= MAX_QUEUE_SIZE) flushLogs();
}

async function flushLogs() {
  if (logQueue.length === 0) return;

  const logsToInsert = logQueue.splice(0, logQueue.length);
  try {
    const values = logsToInsert.map((l) => [
      l.level,
      l.message,
      JSON.stringify(l.meta || {}),
      l.created_at,
    ]);

    await pool.query(
      "INSERT INTO system_logs (level, message, meta, created_at) VALUES ?",
      [values]
    );
  } catch (err) {
    console.error("⚠️ Failed to insert DB logs:", err);
  }
}

// Periodically flush logs
setInterval(flushLogs, FLUSH_INTERVAL);

// 🧹 Cleanup logs older than 60 days (run every 24h)
setInterval(async () => {
  try {
    await pool.query("DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL 60 DAY");
  } catch (err) {
    console.error("⚠️ Failed to cleanup old logs:", err);
  }
}, 24 * 60 * 60 * 1000);
