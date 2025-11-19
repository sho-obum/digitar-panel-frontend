import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import { getRealIp } from "@/lib/getRealIp";
import { ResultSetHeader } from "mysql2";
import { getServerSession } from "next-auth";
import Email from "next-auth/providers/email";
import { NextResponse, NextRequest, userAgent } from "next/server";

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
  try {
    //parse data
    const body: CreateEmailTemplateRequest = await request.json();
    //user auth?
    const session = await getServerSession(authOptions);
    const userID = session?.user?.id || null;
    const email = session?.user?.email || null;

    // if user is not auth - REJECT REQUEST
    if (!userID) {
      console.warn("Unauthorized Request to create email template", {
        userAgent: request.headers.get("user-agent"),
        userIP: userIp,
      });

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

    //case :: if tempalte with the same name already exist for user

    //insert into db

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO user_email_templates 
       (user_id, category_id, name, template_for, subject, body_html, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
      [
        userID,
        body.campaignCategory,
        templateName,
        templateFor,
        subject,
        htmlBody,
      ]
    );

     console.info("Email template created successfully", {
      templateId: result.insertId,
      templateName: templateName,
      userId: userID,
      userIP: userIp,
    });

    // return success response

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
    console.error("POST /api/templates/email/create-email error:", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      userAgent: request.headers.get("user-agent"),
      userIP: userIp,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create email template",
        error: errorMessage,
      },
      { status: 500 } // 500 = Server error
    );
  }
}
