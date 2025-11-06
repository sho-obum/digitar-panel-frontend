import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Format with timestamps and JSON
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    ({ timestamp, level, message, ...meta }) =>
      `[${timestamp}] [${level.toUpperCase()}] ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ""
      }`
  )
);

// 🧩 Winston logger instance
export const fileLogger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, `app-${new Date().toISOString().split("T")[0]}.log`),
      maxsize: 5 * 1024 * 1024, // 5MB per file
      maxFiles: 30, // Keep 30 daily logs
    }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

// 🧹 Optional: auto-delete old log files (>30 days)
export function cleanupOldLogs() {
  const now = Date.now();
  fs.readdirSync(logDir).forEach((file) => {
    const filePath = path.join(logDir, file);
    const stat = fs.statSync(filePath);
    const ageDays = (now - stat.mtimeMs) / (1000 * 60 * 60 * 24);
    if (ageDays > 30) fs.unlinkSync(filePath);
  });
}
