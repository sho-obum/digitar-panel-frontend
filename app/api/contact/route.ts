import { NextResponse } from "next/server";

/* TYPES */

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
}


/* POST ENDPOINT */

export async function POST(request: Request) {
  try {
    const body: ContactFormData = await request.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // TODO: Implementcontact form submission logic 
   

    console.log("Contact form submission:", {
      timestamp: new Date().toISOString(),
      ...body,
    });

    // Example implementation - you can replace this with your actual logic:
    // - Send email to admin
    // - Store in database

    // abhi ke liye we'll just log and return success

    return NextResponse.json(
      {
        success: true,
        message: "Your request has been received. We'll contact you soon.",
        data: {
          name: body.name,
          email: body.email,
          company: body.company || "Not provided",
          submittedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 }
    );
  }
}
