import { Connection, PublicKey } from '@solana/web3.js';

// Helius API endpoint - du skal få en gratis API key fra helius.dev
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || 'your-helius-api-key';
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// $PUMPFLIP token mint address - skal erstattes med den rigtige adresse
const PUMPFLIP_MINT = process.env.PUMPFLIP_MINT_ADDRESS || '11111111111111111111111111111112';

interface TokenHolder {
  address: string;
  balance: number;
  decimals: number;
}

interface HeliusTokenAccount {
  account: {
    data: {
      parsed: {
        info: {
          mint: string;
          owner: string;
          tokenAmount: {
            amount: string;
            decimals: number;
            uiAmount: number;
          };
        };
      };
    };
  };
}

export class TokenHolderService {
  private connection: Connection;
  private cachedHolders: Map<string, { balance: number; timestamp: number }> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutter cache

  constructor() {
    this.connection = new Connection(HELIUS_RPC, 'confirmed');
  }

  /**
   * Scraper alle token holders for $PUMPFLIP token
   */
  async scrapeAllHolders(): Promise<TokenHolder[]> {
    try {
      console.log('🔍 Scraping token holders for:', PUMPFLIP_MINT);
      
      // Check hvis vi har en gyldig API key
      if (!HELIUS_API_KEY || HELIUS_API_KEY === 'your-helius-api-key') {
        console.log('⚠️ No valid Helius API key found, using demo data');
        return this.getDemoHolders();
      }
      
      const mintPublicKey = new PublicKey(PUMPFLIP_MINT);
      const holders: TokenHolder[] = [];
      
      // Brug Helius API til at få alle token accounts
      const response = await fetch(HELIUS_RPC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'get-token-accounts',
          method: 'getTokenAccounts',
          params: [
            mintPublicKey.toString(),
            {
              programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
            }
          ]
        })
      });

      if (!response.ok) {
        console.log(`⚠️ API error (${response.status}), falling back to demo data`);
        return this.getDemoHolders();
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Helius API error:', data.error);
        throw new Error(data.error.message);
      }

      const tokenAccounts = data.result || [];
      
      for (const account of tokenAccounts) {
        const accountData = account.account.data.parsed.info;
        const balance = accountData.tokenAmount.uiAmount;
        
        // Kun inkluder accounts med balance > 0
        if (balance > 0) {
          holders.push({
            address: accountData.owner,
            balance: balance,
            decimals: accountData.tokenAmount.decimals
          });
        }
      }

      // Sorter efter balance (højest først)
      holders.sort((a, b) => b.balance - a.balance);
      
      // Opdater cache
      this.updateCache(holders);
      
      console.log(`✅ Found ${holders.length} token holders`);
      return holders;
      
    } catch (error) {
      console.error('❌ Error scraping token holders:', error);
      console.log('⚠️ Falling back to demo data due to API error');
      return this.getDemoHolders();
    }
  }

  /**
   * Tjek om en wallet holder $PUMPFLIP tokens
   */
  async checkWalletBalance(walletAddress: string): Promise<{ hasTokens: boolean; balance: number }> {
    try {
      // Tjek cache først
      const cached = this.cachedHolders.get(walletAddress);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return {
          hasTokens: cached.balance > 0,
          balance: cached.balance
        };
      }

      // Hvis ikke i cache, scrape alle holders (dette opdaterer cache)
      await this.scrapeAllHolders();
      
      // Tjek cache igen
      const updatedCached = this.cachedHolders.get(walletAddress);
      if (updatedCached) {
        return {
          hasTokens: updatedCached.balance > 0,
          balance: updatedCached.balance
        };
      }

      // Wallet ikke fundet = ingen tokens
      return { hasTokens: false, balance: 0 };
      
    } catch (error) {
      console.error('Error checking wallet balance:', error);
      
      // Fallback til demo data hvis API fejler
      return this.getDemoBalance(walletAddress);
    }
  }

  /**
   * Opdater cache med holder data
   */
  private updateCache(holders: TokenHolder[]) {
    const timestamp = Date.now();
    this.cachedHolders.clear();
    
    for (const holder of holders) {
      this.cachedHolders.set(holder.address, {
        balance: holder.balance,
        timestamp
      });
    }
  }

  /**
   * Demo/fallback data hvis API ikke virker
   */
  private getDemoBalance(walletAddress: string): { hasTokens: boolean; balance: number } {
    const testWalletsWithTokens = [
      '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
      'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7Profe7KeeYu',
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    ];

    const hasTokens = testWalletsWithTokens.includes(walletAddress);
    
    if (hasTokens) {
      const balances: { [key: string]: number } = {
        '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM': 1250.75,
        '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1': 500.25,
        'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7Profe7KeeYu': 2500.00,
        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 750.50,
      };
      
      return {
        hasTokens: true,
        balance: balances[walletAddress] || 1000
      };
    }
    
    return { hasTokens: false, balance: 0 };
  }

  /**
   * Demo/fallback holders data hvis API ikke virker
   */
  private getDemoHolders(): TokenHolder[] {
    return [
      // HEADS Team (Position 1-50)
      { address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', balance: 25000, decimals: 6 },
      { address: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', balance: 22500, decimals: 6 },
      { address: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7Profe7KeeYu', balance: 20000, decimals: 6 },
      { address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', balance: 18500, decimals: 6 },
      { address: 'HolderDemo1111111111111111111111111111111', balance: 17000, decimals: 6 },
      { address: 'HolderDemo2222222222222222222222222222222', balance: 15500, decimals: 6 },
      { address: 'HolderDemo3333333333333333333333333333333', balance: 14000, decimals: 6 },
      { address: 'HolderDemo4444444444444444444444444444444', balance: 12500, decimals: 6 },
      { address: 'HolderDemo5555555555555555555555555555555', balance: 11000, decimals: 6 },
      { address: 'HolderDemo6666666666666666666666666666666', balance: 10500, decimals: 6 },
      
      // TAILS Team (Position 51-100) 
      { address: 'TailsDemo1111111111111111111111111111111', balance: 5000, decimals: 6 },
      { address: 'TailsDemo2222222222222222222222222222222', balance: 4800, decimals: 6 },
      { address: 'TailsDemo3333333333333333333333333333333', balance: 4600, decimals: 6 },
      { address: 'TailsDemo4444444444444444444444444444444', balance: 4400, decimals: 6 },
      { address: 'TailsDemo5555555555555555555555555555555', balance: 4200, decimals: 6 },
      { address: 'TailsDemo6666666666666666666666666666666', balance: 4000, decimals: 6 },
      { address: 'TailsDemo7777777777777777777777777777777', balance: 3800, decimals: 6 },
      { address: 'TailsDemo8888888888888888888888888888888', balance: 3600, decimals: 6 },
      { address: 'TailsDemo9999999999999999999999999999999', balance: 3400, decimals: 6 },
      { address: 'TailsDemoAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', balance: 3200, decimals: 6 },
    ];
  }

  /**
   * Get top holders (for admin/stats purposes)
   */
  async getTopHolders(limit: number = 50): Promise<TokenHolder[]> {
    try {
      const allHolders = await this.scrapeAllHolders();
      return allHolders.slice(0, limit);
    } catch (error) {
      console.error('Error getting top holders:', error);
      return [];
    }
  }

  /**
   * Get holder count
   */
  async getHolderCount(): Promise<number> {
    try {
      const holders = await this.scrapeAllHolders();
      return holders.length;
    } catch (error) {
      console.error('Error getting holder count:', error);
      return 0;
    }
  }
}

// Singleton instance
export const tokenHolderService = new TokenHolderService();

