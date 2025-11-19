import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { log } from "@/lib/logger";
import { getRealIp } from "@/lib/getRealIp";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface CategoryRequest {
  category_name: string;
  description?: string;
}

// Define the response structure for consistency
interface CategoryResponse {
  success: boolean;
  message: string;
  category?: {
    id: number;
    name: string;
    default_cat: number;
    description: string;
    isActive: boolean;
  };
  error?: string;
}
function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^\w\s-]/g, "") // remove special chars
    .trim()
    .replace(/\s+/g, "-");
}

export async function GET(request: NextRequest) {
  const userIP = getRealIp(request);
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    log.info('Requesting for client cat list', { userAgent: request.headers.get('user-agent'), userIP: userIP });
    if (!userId) {
      log.warn('Unauthorized Request for client cat list', { userAgent: request.headers.get('user-agent'), userIP: userIP });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [rows] = await pool.query(
      `SELECT id as client_cat, name as cat_name, description, status as is_active, is_default as default_cat, updated_at, created_at  FROM template_categories 
       WHERE is_delete='0' AND (is_default = 1 OR user_id = ?)
       ORDER BY name ASC`,
      [userId]
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    log.error("GET /api/templates/email/categories error:", { error: error, userAgent: request.headers.get('user-agent'), userIP: userIP });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function POST(req: Request): Promise<NextResponse<CategoryResponse>> {
  const userIP = getRealIp(req);
  try {
    // ✅ Step 1: Check Auth
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const email = session?.user?.email || null;
    const body = (await req.json()) as CategoryRequest;
    const { category_name, description = "" } = body;

    log.info('Requesting to add client cat', { category_name: category_name, description: description, userAgent: req.headers.get('user-agent'), userIP: userIP });

    if (!userId) {
      log.warn('❌ Unauthorized Request to add client cat', { category_name: category_name, description: description, userAgent: req.headers.get('user-agent'), userIP: userIP });
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!category_name || typeof category_name !== "string") {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const cleanName = category_name.trim();
    const slug = slugify(cleanName);
    const cleanDescription = description.trim();

    const [exists] = await pool.execute<RowDataPacket[]>(
      `
      SELECT id 
      FROM template_categories 
      WHERE slug = ? AND is_delete='0'
      AND (is_default = 1 OR user_id = ?)
      `,
      [slug, userId]
    );

    if (exists.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Category '${cleanName}' already exists.`,
        },
        { status: 409 }
      );
    }

    const [insert] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO template_categories 
      (name, slug, description, user_id, is_default, created_at, created_by) 
      VALUES (?, ?, ?, ?, 0, NOW(), ?)
      `,
      [cleanName, slug, cleanDescription, userId, email]
    );

    // ✅ Step 5: Respond
    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      category: {
        id: insert.insertId,
        name: cleanName,
        description: cleanDescription,
        isActive: true,
        default_cat: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    log.warn("POST /api/templates/email/categories error:", { error: error, userAgent: req.headers.get('user-agent'), userIP: userIP });
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: categoryId } = await context.params;
  const userIP = getRealIp(request);

  log.info('Requesting for delete Client Cat', { userAgent: request.headers.get('user-agent'), userIP: userIP });
  if (!categoryId) {
    return NextResponse.json({ error: "Category ID required" }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    if (!userId) {
      log.warn('Unauthorized Request for delete Client Cat', { userAgent: request.headers.get('user-agent'), userIP: userIP });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const [rows]: any = await pool.query(
      "SELECT * FROM template_categories WHERE id = ? AND user_id= ?",
      [categoryId, userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const category = rows[0];

    if (category.is_default === 1) {
      return NextResponse.json(
        { error: "Default categories cannot be deleted" },
        { status: 403 }
      );
    }

    if (category.is_delete === 1) {
      return NextResponse.json(
        { message: "Category already deleted" },
        { status: 200 }
      );
    }

    await pool.query(
      `UPDATE template_categories SET is_delete = 1 WHERE id = ?`,
      [categoryId]
    );

    await pool.query(
      `INSERT INTO template_categories_logs(action_type, user_id, category_id, name, description, status, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      ['DELETE CLIENT CATEGORY', userId, categoryId, category.name, category.description, category.status, userIP]
    );

    // --- 5️⃣ Return success ---
    return NextResponse.json({
      success: true,
      message: `Category "${category.name}" deleted successfully`,
      deleted_by_ip: userIP,
      id: categoryId,
    });
  } catch (err) {
    log.error("DELETE /api/templates/email/categories error:", { error: err, userAgent: request.headers.get('user-agent'), userIP: userIP });
    return NextResponse.json(
      { error: "Server error deleting category" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  
  const { name='', description='', isActive='' } = body;
  const userIP = getRealIp(request);
  log.info('Requesting for Update Client CatData', { userAgent: request.headers.get('user-agent'), userIP: userIP });

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    
    if (!userId) {
      log.warn('Unauthorized Requestfor Update Client CatData', { userAgent: request.headers.get('user-agent'), userIP: userIP });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const [rows]: any = await pool.query(
      "SELECT * FROM template_categories WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const category = rows[0];
    const status = category.status;
    if (category.is_default === 1) {
      return NextResponse.json(
        { error: "Default categories cannot be updated" },
        { status: 403 }
      );
    }

    if (category.is_delete === 1) {
      return NextResponse.json(
        { message: "Category already deleted" },
        { status: 200 }
      );
    }

    if(isActive !== '' && name === ''){
      await pool.query(
      `UPDATE template_categories
     SET status = ?, updated_at = NOW()
     WHERE id = ? AND is_delete = '0'`,
      [isActive, id]
    );
    }else{
      await pool.query(
      `UPDATE template_categories
     SET name = ?, slug = ?, description = ?, updated_at = NOW()
     WHERE id = ? AND is_delete = '0'`,
      [name, slugify(name), description, id]
    );
    }
    

    await pool.query(
      `INSERT INTO template_categories_logs(action_type, user_id, category_id, name, description, status, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      ['UPDATE CLIENT DETAILS', userId, id, category.name, category.description, status, userIP]
    );
    return NextResponse.json({
      success: true,
      category: { id, name, description, updatedAt: new Date() },
    });

  } catch (err) {
    log.error("UPDATE /api/templates/email/categories error:", { error: err, userAgent: request.headers.get('user-agent'), userIP: userIP });
    return NextResponse.json(
      { error: "Server error updating category" },
      { status: 500 }
    );
  }
}