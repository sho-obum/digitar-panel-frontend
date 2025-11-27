export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { source, bundle_id, page = 1, limit = 10, fromDate, toDate } = body;

    if (!source || !bundle_id) {
      return Response.json(
        { success: false, error: 'Missing source or bundle_id' },
        { status: 400 }
      );
    }

    console.log('[API] Received request:', { source, bundle_id, page, limit });

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
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log('[API] Response data:', { success: data.success, dataLength: data.data?.length, total_pages: data.total_pages, total: data.total });
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch campaign details' },
      { status: 500 }
    );
  }
}
