import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();
    console.log('🔶 CSP Violation:', JSON.stringify(report, null, 2));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('🔴 Error parsing CSP report:', error);
    return new NextResponse(null, { status: 400 });
  }
}
