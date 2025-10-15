import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { previewLink, appid, orgID } = body;

    if (!previewLink || !appid || !orgID) {
      return NextResponse.json(
        { error: 'previewLink, appid, and orgID are required' },
        { status: 400 }
      );
    }

    // Mock response data - contact persons
    const response = [
      {
        person: "Right Sharma",
        email: "ananya.sharma@swiggy.com",
        mobile: "+919876543121",
        profile: "https://image.jpeg",
        linkedin: "https://linkedin.com/in/ananya",
    
      },
      {
        person: "Rohit Gupta",
        email: "rohit.gupta@swiggy.com",
        mobile: "+919811123456",
        profile: "https://image.jpeg",
        linkedin: "https://linkedin.com/in/rohit",
      },
      {
        person: "Meera Nair",
        email: "meera.nair@swiggy.com",
        mobile: "+919812345678",
        profile: "https://image.jpeg",
        linkedin: "https://linkedin.com/in/meera",
      },
      {
        person: "Karan Mehta",
        email: "karan.mehta@swiggy.com",
        mobile: "+919899112233",
        profile: "https://image.jpeg",
        linkedin: "https://linkedin.com/in/karan",
      },
      {
        person: "Priya Desai",
        email: "priya.desai@swiggy.com",
        mobile: "+919833445566",
        profile: "https://image.jpeg",
        linkedin: "https://linkedin.com/in/priya",
      },
    ];

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Approve API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
