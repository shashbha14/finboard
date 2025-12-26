import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const functionType = searchParams.get('function') || 'GLOBAL_QUOTE';
    const token = process.env.NEXT_PUBLIC_ALPHAVANTAGE_TOKEN || process.env.ALPHAVANTAGE_TOKEN;

    if (!symbol) {
        return NextResponse.json(
            { error: 'Symbol parameter is required' },
            { status: 400 }
        );
    }

    if (!token) {
        return NextResponse.json(
            { error: 'Alpha Vantage token is not configured' },
            { status: 500 }
        );
    }

    try {
        const alphaVantageUrl = `https://www.alphavantage.co/query?function=${functionType}&symbol=${symbol.toUpperCase()}&apikey=${token}`;
        const response = await fetch(alphaVantageUrl);
        
        if (!response.ok) {
            throw new Error(`Alpha Vantage API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Check for API error messages
        if (data['Error Message']) {
            throw new Error(data['Error Message']);
        }
        if (data['Note']) {
            throw new Error('API call frequency limit reached. Please try again later.');
        }
        
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[Alpha Vantage Proxy Error]', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch data from Alpha Vantage' },
            { status: 500 }
        );
    }
}

