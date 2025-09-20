import { NextResponse } from 'next/server';
import { tokenHolderService } from '@/lib/tokenHolders';

// Admin endpoint til at se token holders
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action') || 'top';

    switch (action) {
      case 'top':
        const topHolders = await tokenHolderService.getTopHolders(limit);
        return NextResponse.json({
          ok: true,
          action: 'top_holders',
          count: topHolders.length,
          holders: topHolders
        });

      case 'count':
        const holderCount = await tokenHolderService.getHolderCount();
        return NextResponse.json({
          ok: true,
          action: 'holder_count',
          totalHolders: holderCount
        });

      case 'scrape':
        console.log('🔄 Force scraping all holders...');
        const allHolders = await tokenHolderService.scrapeAllHolders();
        return NextResponse.json({
          ok: true,
          action: 'force_scrape',
          message: 'Scraping completed',
          totalHolders: allHolders.length,
          topHolders: allHolders.slice(0, 10) // Vis top 10
        });

      default:
        return NextResponse.json({
          ok: false,
          error: 'Invalid action. Use: top, count, or scrape'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Admin holders endpoint error:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch holder data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST endpoint til at tjekke en specifik wallet
export async function POST(req: Request) {
  try {
    const { wallet } = await req.json();
    
    if (!wallet) {
      return NextResponse.json({
        ok: false,
        error: 'Wallet address required'
      }, { status: 400 });
    }

    const result = await tokenHolderService.checkWalletBalance(wallet);
    
    return NextResponse.json({
      ok: true,
      wallet,
      hasTokens: result.hasTokens,
      balance: result.balance
    });

  } catch (error) {
    console.error('❌ Admin wallet check error:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to check wallet',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

