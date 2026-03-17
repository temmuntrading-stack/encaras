import { NextRequest, NextResponse } from 'next/server';

// Image proxy to bypass Encar's hotlink-protection
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl || !imageUrl.includes('encar.com')) {
    return new NextResponse('Invalid image URL', { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'Referer': 'http://www.encar.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return new NextResponse('Image fetch failed', { status: 502 });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // cache 1 day
      },
    });
  } catch (err) {
    console.error('Image proxy error:', err);
    return new NextResponse('Proxy error', { status: 500 });
  }
}
