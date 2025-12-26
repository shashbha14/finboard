import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const apiKey = process.env.NEXT_PUBLIC_INDIAN_API_KEY || process.env.INDIAN_API_KEY || 'sk-live-RgtAJsTIcOe1ee1ygYBbSozk5QGyxkNrLrX5HcI6';

    if (!name) {
        return NextResponse.json(
            { error: 'Name parameter is required' },
            { status: 400 }
        );
    }

    try {
        const indianApiUrl = `https://stock.indianapi.in/stock?name=${encodeURIComponent(name)}`;
        const response = await fetch(indianApiUrl, {
            headers: {
                'X-Api-Key': apiKey
            }
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error('Failed to parse upstream JSON', e);
            data = { error: 'Invalid JSON response from upstream Provider' };
        }

        if (!response.ok) {
            // Forward the upstream status code (e.g. 404 Not Found)
            return NextResponse.json(data, { status: response.status });
        }

        // Check for logic errors within 200 OK responses
        if (data.error) {
            return NextResponse.json(data, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[Indian API Proxy Error]', error);
        return NextResponse.json(
            { error: error.message || 'Internal Proxy Error' },
            { status: 500 }
        );
    }
}

