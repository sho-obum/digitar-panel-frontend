import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import { getRealIp } from "@/lib/getRealIp";
import { log } from "@/lib/logger";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";

interface updateEmailTemplateRequest {
  template_id: number;
  templateName: string;
  subject: string;
  templateFor: "intial" | "followup" | "other";
  campaignCategory: string;
  htmlBody: string;
}

interface EmailTemplateResponse {
  success: boolean;
  message: string;
  tempalte?: {
    id: number;
    name: string;
    subject: string;
    templateFor: string;
    category_id: number;
  };
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<EmailTemplateResponse>> {
  const userIp = getRealIp(request);
  const session = await getServerSession(authOptions);
  const userID = session?.user?.id || null;
  log.info("POST /api/templates/email/update Creating new email template", { userIP: userIp, userAgent: request.headers.get("user-agent"), userID: userID || null, });
  try {
    const body: updateEmailTemplateRequest = await request.json();
    if (!userID) {
      log.warn("Unauthorized Request to update email template", { userIP: userIp, userAgent: request.headers.get("user-agent"), userID: null, });
      return NextResponse.json(
        { success: false, message: "Unauthorized", error: "Unauthorized" },
        { status: 401 }
      );
    }
    if (
      !body.template_id ||
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
    const templateId = body.template_id;
    const templateName = body.templateName.trim();
    const subject = body.subject.trim();
    const htmlBody = body.htmlBody.trim();
    const templateFor = body.templateFor.toLowerCase();

    const [templateCheck] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM user_email_templates WHERE id = ? AND user_id = ?`,
      [templateId, userID]
    );

    if (templateCheck.length === 0) {
        return NextResponse.json(
        {
            success: false,
            message: "Template not found or access denied",
            error: "Not Found",
        },
        { status: 404 }
        );
    }

    await pool.execute<ResultSetHeader>(
      `UPDATE user_email_templates SET name = ?, subject = ?, template_for = ?, category_id = ?, body_html = ?, updated_at = NOW(), user_ip = ? WHERE id = ? AND user_id = ?`,
      [ 
        templateName,
        subject,
        templateFor,    
        body.campaignCategory,
        htmlBody,
        userIp,
        templateId,
        userID,
        ]
    );

    return NextResponse.json(
        {
        success: true,
        message: "Email template updated successfully",
        tempalte: {
            id: templateId,
            name: templateName,
            subject: subject,
            templateFor: templateFor,
            category_id: Number(body.campaignCategory),
        },
        },
        { status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error("POST /api/templates/email/update error:", { error: errorMessage, userIP: userIp, userAgent: request.headers.get("user-agent"), userID: session?.user?.id || null, });  
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update email template",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
