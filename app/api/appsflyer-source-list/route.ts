import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || '';
    const type = searchParams.get('type') || 'single';
    const fromDate = searchParams.get('fromDate') || '';
    const toDate = searchParams.get('toDate') || '';

    const url = `https://api.digitarmedia.com/11-2025/source-list.php?id=${id}&type=${type}&fromDate=${fromDate}&toDate=${toDate}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': '5cc21b4ce9731d7a521c44cd0f1332a3',
      },
    });

    console.log('Source list response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch source list', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Success data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching source list:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
