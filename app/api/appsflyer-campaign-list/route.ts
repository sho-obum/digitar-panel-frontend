import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.digitarmedia.com/11-2025/camp-list.php?status=1', {
      method: 'GET',
      headers: {
        'x-api-key': '5cc21b4ce9731d7a521c44cd0f1332a3',
      },
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch campaign list', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Success data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching campaign list:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
