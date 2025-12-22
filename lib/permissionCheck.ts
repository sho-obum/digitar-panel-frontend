import { pool } from "@/lib/db";
import { log } from "@/lib/logger";

export async function userPermission(
  userId: string,
  pathname: string
): Promise<boolean> {
  try {
    const [rows]: any = await pool.query(
      `
      SELECT 1
      FROM users u
      JOIN roles r ON r.id = u.role_id
      JOIN role_permissions rp 
        ON rp.role_id = r.id AND rp.allowed = 1
      JOIN pages p ON p.id = rp.page_id
      WHERE u.id = UUID_TO_BIN(?)
        AND p.path = ?
        AND u.status = 'active'
        AND p.status = 'active'
      LIMIT 1
      `,
      [userId, pathname]
    );

    return Array.isArray(rows) && rows.length > 0;
  } catch (err) {
    log.error("Permission check failed", err);
    return false;
  }
}
