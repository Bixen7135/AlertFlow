import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/map/events
 * Proxy map events requests to backend API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build backend URL with query params
    const backendUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/map/events`);

    // Forward query parameters
    if (searchParams.has('bounds')) {
      backendUrl.searchParams.set('bounds', searchParams.get('bounds')!);
    }
    if (searchParams.has('type')) {
      backendUrl.searchParams.set('type', searchParams.get('type')!);
    }
    if (searchParams.has('severity')) {
      backendUrl.searchParams.set('severity', searchParams.get('severity')!);
    }

    const response = await fetch(backendUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 5 minutes to reduce backend load
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Backend request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Map events proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch map events' },
      { status: 500 }
    );
  }
}
