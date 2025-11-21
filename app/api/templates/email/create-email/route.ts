import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import { getRealIp } from "@/lib/getRealIp";
import { log } from "@/lib/logger";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";

interface CreateEmailTemplateRequest {
  templateName: string;
  subject: string;
  templateFor: "intial" | "followup" | "other";
  campaignCategory: string;
  htmlBody: string;
}

interface EmailTemplateResponse {
  success: boolean;
  message: string;
  template?: {
    id: number;
    name: string;
    subject: string;
    templateFor: string;
    category_id: number;
  };
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<{ success: boolean; templates?: RowDataPacket[]; error?: string; }>> {
  const userIp = getRealIp(request);
  const session = await getServerSession(authOptions);
  const userID = session?.user?.id || null;
  log.info("GET /api/templates/email/create-email : Fetching email templates", { userIP: userIp, userAgent: request.headers.get("user-agent"), userID: userID || null, });
  try {
    if (!userID) {
      log.warn("Unauthorized Request to fetch email templates", { userIP: userIp, userAgent: request.headers.get("user-agent"), userID: null});
      return NextResponse.json({ success: false, error: "Unauthorized" },{ status: 401 });
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT  uet.id, uet.name AS templateName, uet.subject, uet.template_for AS templateFor, uet.body_html AS htmlBody, uet.category_id, cat.name as category, uet.is_default AS isDefault, uet.status, uet.created_at AS addedAt
      FROM user_email_templates uet JOIN template_categories cat ON uet.category_id = cat.id WHERE uet.is_delete='0' AND uet.user_id = ?`, [userID]
    );

    return NextResponse.json({
      success: true,
      templates: rows,
    });
  } catch (error: any) {
    log.error("GET /api/templates/email/create-email :Error fetching email templates", { error: error instanceof Error ? error.message : String(error), userIP: userIp, userAgent: request.headers.get("user-agent"), userID: userID || null, });
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<EmailTemplateResponse>> {
  const userIp = getRealIp(request);
  const session = await getServerSession(authOptions);
  const userID = session?.user?.id || null;
  log.info("POST /api/templates/email/create-email Creating new email template", { userIP: userIp, userAgent: request.headers.get("user-agent"), userID: userID || null, });
  try {
    //parse data
    const body: CreateEmailTemplateRequest = await request.json();
    //user auth?

    // if user is not auth - REJECT REQUEST
    if (!userID) {
      log.warn("Unauthorized Request to create email template", { userIP: userIp, userAgent: request.headers.get("user-agent"), userID: null, });
      return NextResponse.json(
        { success: false, message: "Unauthorized", error: "Unauthorized" },
        { status: 401 }
      );
    }

    //validate

    if (
      !body.templateName ||
      !body.subject ||
      !body.templateFor ||
      !body.campaignCategory ||
      !body.htmlBody
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          error: "Bad Request",
        },
        { status: 400 }
      );
    }

    //clean and normalise
    const templateName = body.templateName.trim();
    const subject = body.subject.trim();
    const htmlBody = body.htmlBody.trim();
    const templateFor = body.templateFor.toLowerCase();

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO user_email_templates 
       (user_id, category_id, name, template_for, subject, body_html, status, created_at, updated_at, user_ip)
       VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW(), ?)`,
      [
        userID,
        body.campaignCategory,
        templateName,
        templateFor,
        subject,
        htmlBody,
        userIp,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Email template created successfully",
        template: {
          id: result.insertId, // Auto-generated ID from database
          name: templateName,
          subject: subject,
          templateFor: templateFor,
          category_id: Number(body.campaignCategory),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error("POST /api/templates/email/create-email error:", { error: errorMessage, userIP: userIp, userAgent: request.headers.get("user-agent"), userID: session?.user?.id || null, });  
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create email template",
        error: errorMessage,
      },
      { status: 500 } 
    );
  }
}
