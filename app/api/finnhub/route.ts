import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN || process.env.FINNHUB_TOKEN;

    if (!symbol) {
        return NextResponse.json(
            { error: 'Symbol parameter is required' },
            { status: 400 }
        );
    }

    if (!token) {
        return NextResponse.json(
            { error: 'Finnhub token is not configured' },
            { status: 500 }
        );
    }

    try {
        const finnhubUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${token}`;
        const response = await fetch(finnhubUrl);
        
        if (!response.ok) {
            throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[Finnhub Proxy Error]', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch data from Finnhub' },
            { status: 500 }
        );
    }
}

