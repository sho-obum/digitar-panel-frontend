import { NextRequest, NextResponse } from 'next/server';
import { detectLinkType } from '@/helpers/detectLinkType';
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
    const linkType = detectLinkType(previewLink);

    if (linkType === 'invalid') {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }else if(linkType === 'web'){
      return NextResponse.json(
        { error: 'Please provide a valid App Store or Play Store link' },
        { status: 400 }
      );
    }else{
      console.log('Detected link type:', linkType);
    }

    // Mock response data
    const response = {
      appData: {
        appid: "com.swiggy.android",
        logo: "https://play-lh.googleusercontent.com/1gkXHjv0bX4y2Yk2b8r3cX9F6fJt5e5Z5z5z5z5z5z5z5z5=s180-rw",
        title: "Swiggy ",
        category: "Food & Drink",
        bundleId: "in.swiggy.android",
        storeLink: previewLink, 
        linkType: linkType, // Added link type
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
