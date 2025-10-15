import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { previewLink } = body;

    if (!previewLink) {
      return NextResponse.json(
        { error: 'previewLink is required' },
        { status: 400 }
      );
    }

    // Mock response data
    const response = {
      appData: {
        appid: "com.swiggy.android",
        logo: "https://play-lh.googleusercontent.com/1gkXHjv0bX4y2Yk2b8r3cX9F6fJt5e5Z5z5z5z5z5z5z5z5=s180-rw",
        title: "Swiggy ",
        category: "Food & Drink",
        bundleId: "in.swiggy.android", // Added for frontend
        storeLink: previewLink, // Pass back the preview link
      },
      orgData: {
        orgName: "Org of Swiggy",
        orgID: "jhvcu78789789dwgdv",
        orgLogo: "https://play-lh.googleusercontent.com/1gkXHjv0bX4y2Yk2b8r3cX9F6fJt5e5Z5z5z5z5z5z5z5z5=s180-rw",
        orgWebsite: "https://www.swiggy.com/",
        orgEmail: "contact@swiggy.com", // Added missing email
        linkedin: "https://linkedin.com/company/swiggy", // Added for frontend
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Preview link API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
