import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { page = 1, limit = 10, fromDate, toDate, showDate, bundle_id = 'all' } = body;

    console.log('\n🔥 BACKEND ROUTE - appsflyer-camp-details-by-date');
    console.log('📥 Received body:', JSON.stringify(body, null, 2));
    console.log('🎯 bundle_id:', bundle_id);
    console.log('📅 showDate:', showDate);

    const phpPayload = {
      page,
      limit,
      fromDate,
      toDate,
      showDate,
      bundle_id
    };

    console.log('🚀 SENDING TO PHP API:', JSON.stringify(phpPayload, null, 2));

    const response = await fetch('https://api.digitarmedia.com/11-2025/camp-details-by-date.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '5cc21b4ce9731d7a521c44cd0f1332a3',
      },
      body: JSON.stringify(phpPayload),
    });

    if (!response.ok) {
      console.error('❌ PHP API responded with status:', response.status);
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ PHP API Response received');
    console.log('📊 Data count:', data.data?.length || 0);
    console.log('📄 Total pages:', data.total_pages);
    console.log('📈 Total records:', data.total);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching campaign details by date:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign details by date' },
      { status: 500 }
    );
  }
}
