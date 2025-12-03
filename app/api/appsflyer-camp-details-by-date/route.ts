import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { page = 1, limit = 10, fromDate, toDate } = body;

    const response = await fetch('https://api.digitarmedia.com/11-2025/camp-details-by-date.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '5cc21b4ce9731d7a521c44cd0f1332a3',
      },
      body: JSON.stringify({
        page,
        limit,
        fromDate,
        toDate,
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching campaign details by date:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign details by date' },
      { status: 500 }
    );
  }
}
