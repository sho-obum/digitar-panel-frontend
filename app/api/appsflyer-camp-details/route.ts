import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { source, bundle_id, page = 1, limit = 10, fromDate, toDate, showDate, showPidColumn } = body;

    if (!source || !bundle_id) {
      return NextResponse.json(
        { success: false, error: 'Missing source or bundle_id' },
        { status: 400 }
      );
    }

    console.log('🔥 Route received showDate:', showDate);

    const response = await fetch('https://api.digitarmedia.com/11-2025/camp-details-by-source.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '5cc21b4ce9731d7a521c44cd0f1332a3',
      },
      body: JSON.stringify({
        source,
        bundle_id,
        page,
        limit,
        fromDate,
        toDate,
        showDate,
        showPidColumn
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching campaign details by source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign details by source' },
      { status: 500 }
    );
  }
}
