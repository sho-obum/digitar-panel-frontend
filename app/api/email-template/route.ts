import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    
    const subject = "Partnership Opportunity with Your Organization";
    const body = `Dear Team,

I hope this email finds you well. I'm reaching out to explore potential partnership opportunities between our organizations.

We've been impressed by your innovative approach and would love to discuss how we can collaborate to create mutual value.

Would you be available for a brief call next week to discuss this further?

Looking forward to hearing from you.

Best regards,
Your Name
Company Name`;

    // Encode to base64
    const subjectEncoded = Buffer.from(subject).toString("base64");
    const bodyEncoded = Buffer.from(body).toString("base64");

    const response = {
      Subject: subjectEncoded,
      body: bodyEncoded,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Email template API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
