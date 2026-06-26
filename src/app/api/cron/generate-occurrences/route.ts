import { NextRequest, NextResponse } from 'next/server';
import { generateOccurrencesForAllOrgs } from '@/lib/scheduling';

// Intended to be hit by Vercel Cron (see vercel.json) to keep every org's
// schedule rolling forward automatically, so admins don't have to remember
// to click "Roll schedule forward" themselves.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const orgCount = await generateOccurrencesForAllOrgs(8);
  return NextResponse.json({ ok: true, orgsProcessed: orgCount });
}
