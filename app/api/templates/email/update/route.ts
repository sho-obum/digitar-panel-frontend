import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import { getRealIp } from "@/lib/getRealIp";
import { log } from "@/lib/logger";
import { m } from "framer-motion";
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
  log.info("POST /api/templates/email/update Creating new email template", {
    userIP: userIp,
    userAgent: request.headers.get("user-agent"),
    userID: userID || null,
  });
  try {
    const body: updateEmailTemplateRequest = await request.json();
    if (!userID) {
      log.warn("Unauthorized Request to update email template", {
        userIP: userIp,
        userAgent: request.headers.get("user-agent"),
        userID: null,
      });
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
      `SELECT * FROM user_email_templates WHERE id = ? AND user_id = ?`,
      [templateId, userID]
    );
    console.log("Template Check Result:", templateCheck);
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

    const [insertInLog] = await pool.query<ResultSetHeader>(
      `INSERT INTO user_email_templates_logs (user_id, category_id, name, slug, template_for, subject, body_html, status, created_at, user_ip, is_delete) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        userID,
        templateCheck[0].category_id,
        templateCheck[0].name,
        templateCheck[0].slug,
        templateCheck[0].template_for,
        templateCheck[0].subject,
        templateCheck[0].body_html,
        templateCheck[0].status,
        userIp,
        templateCheck[0].is_delete,
      ]
    );

    console.log(
      " Logged template update in logs with ID:",
      insertInLog.insertId
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
    log.error("POST /api/templates/email/update error:", {
      error: errorMessage,
      userIP: userIp,
      userAgent: request.headers.get("user-agent"),
      userID: session?.user?.id || null,
    });
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
// PUT handler - Update template status (active/inactive)
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const userIp = getRealIp(request);
  const session = await getServerSession(authOptions);
  const userID = session?.user?.id || null;

  log.info("PUT /api/templates/email/update : Updating template status", {
    userIP: userIp,
    userAgent: request.headers.get("user-agent"),
    userID: userID || null,
  });

  try {
    // If user is not authenticated
    if (!userID) {
      log.warn(
        "PUT /api/templates/email/update : Unauthorized Request to update template status",
        {
          userIP: userIp,
          userAgent: request.headers.get("user-agent"),
          userID: null,
        }
      );
      return NextResponse.json(
        { success: false, message: "Unauthorized", error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { template_id, status } = body;

    // Validate required fields
    if (!template_id || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          error: "template_id and status are required",
        },
        { status: 400 }
      );
    }

    // Validate status value
    if (!["active", "inactive"].includes(status.toLowerCase())) {
      log.warn("Invalid status value provided", {
        providedStatus: status,
        userID: userID,
        userIP: userIp,
      });
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status",
          error: "Status must be 'active' or 'inactive'",
        },
        { status: 400 }
      );
    }

    // Check if template exists and belongs to user
    const [templateCheck] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM user_email_templates WHERE id = ? AND user_id = ?`,
      [template_id, userID]
    );

    if (templateCheck.length === 0) {
      log.warn(
        "PUT /api/templates/email/update :Template not found or access denied",
        {
          templateId: template_id,
          userId: userID,
          userIP: userIp,
        }
      );
      return NextResponse.json(
        {
          success: false,
          message: "Template not found",
          error: "Template not found or access denied",
        },
        { status: 404 }
      );
    }

    // Update template status
    await pool.execute<ResultSetHeader>(
      `UPDATE user_email_templates SET status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?`,
      [status.toLowerCase(), template_id, userID]
    );

    const [insertInLog] = await pool.query<ResultSetHeader>(
      `INSERT INTO user_email_templates_logs (user_id, category_id, name, slug, template_for, subject, body_html, status, created_at, user_ip, is_delete) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        userID,
        templateCheck[0].category_id,
        templateCheck[0].name,
        templateCheck[0].slug,
        templateCheck[0].template_for,
        templateCheck[0].subject,
        templateCheck[0].body_html,
        templateCheck[0].status,
        userIp,
        templateCheck[0].is_delete,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: `Template status updated to ${status.toLowerCase()}`,
        template: {
          id: template_id,
          status: status.toLowerCase(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error("PUT /api/templates/email/update error:", {
      error: errorMessage,
      userIP: userIp,
      userAgent: request.headers.get("user-agent"),
      userID: session?.user?.id || null,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update template status",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Delete handler

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const userIp = getRealIp(request);
  const session = await getServerSession(authOptions);
  const userID = session?.user?.id || null;

  log.info("DELETE /api/templates/email/update : Deleting email template", {
    userIP: userIp,
    userAgent: request.headers.get("user-agent"),
    userID: userID || null,
  });

  try {
    if (!userID) {
      log.warn("Unauthorized Request to delete email template", {
        userIP: userIp,
        userAgent: request.headers.get("user-agent"),
        userID: null,
      });

      return NextResponse.json(
        { success: false, message: "Unauthorized", error: "Unauthorized" },
        { status: 401 }
      );
    }

    //parse the body
    const body = await request.json();
    const { template_id } = body;

    // validate
    if (!template_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          error: "template_id is required",
        },
        { status: 400 }
      );
    }

    // Check if template exists and belongs to user
    const [templateCheck] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM user_email_templates WHERE id = ? AND user_id = ?`,
      [template_id, userID]
    );

    if (templateCheck.length === 0) {
      log.warn(
        "DELETE /api/templates/email/update: Template not found or access denied",
        {
          templateId: template_id,
          userId: userID,
          userIP: userIp,
        }
      );
      return NextResponse.json(
        {
          success: false,
          message: "Template not found",
          error: "Template not found or access denied",
        },
        { status: 404 }
      );
    }

    // Insert log entry before deletion (audit trail)
    const [insertInLog] = await pool.query<ResultSetHeader>(
      `INSERT INTO user_email_templates_logs (user_id, category_id, name, slug, template_for, subject, body_html, status, created_at, user_ip, is_delete) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        userID,
        templateCheck[0].category_id,
        templateCheck[0].name,
        templateCheck[0].slug,
        templateCheck[0].template_for,
        templateCheck[0].subject,
        templateCheck[0].body_html,
        templateCheck[0].status,
        userIp,
        1, // is_delete = 1 to mark as deleted
      ]
    );

    // Delete template from database
    await pool.execute<ResultSetHeader>(
      `DELETE FROM user_email_templates WHERE id = ? AND user_id = ?`,
      [template_id, userID]
    );

    log.info("DELETE /api/templates/email/update: Template deleted successfully", {
      templateId: template_id,
      userId: userID,
      userIP: userIp,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Template deleted successfully",
        template: {
          id: template_id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error("DELETE /api/templates/email/update error:", {
      error: errorMessage,
      userIP: userIp,
      userAgent: request.headers.get("user-agent"),
      userID: session?.user?.id || null,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete template",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
