import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Solana RPC endpoint - brug Helius, Alchemy eller anden provider i prod
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

// $PUMPFLIP token mint address (dummy - skal erstattes med rigtig adresse)
const PUMPFLIP_MINT = new PublicKey('11111111111111111111111111111112'); // Placeholder

export class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(SOLANA_RPC, 'confirmed');
  }

  async checkPumpFlipBalance(walletAddress: string): Promise<{ hasTokens: boolean; balance: number }> {
    try {
      const walletPublicKey = new PublicKey(walletAddress);
      
      // Get associated token account for $PUMPFLIP
      const associatedTokenAccount = await getAssociatedTokenAddress(
        PUMPFLIP_MINT,
        walletPublicKey
      );

      // Check if the account exists and get balance
      const accountInfo = await this.connection.getTokenAccountBalance(associatedTokenAccount);
      
      if (accountInfo.value) {
        const balance = parseFloat(accountInfo.value.amount) / Math.pow(10, accountInfo.value.decimals);
        return {
          hasTokens: balance > 0,
          balance
        };
      }

      return { hasTokens: false, balance: 0 };
    } catch (error) {
      // Account might not exist or invalid address
      console.error('Solana balance check error:', error);
      return { hasTokens: false, balance: 0 };
    }
  }

  // Demo fallback - kun godkender specifikke test-adresser
  async checkPumpFlipBalanceDemo(walletAddress: string): Promise<{ hasTokens: boolean; balance: number }> {
    // Validate Solana address format
    try {
      new PublicKey(walletAddress);
    } catch {
      return { hasTokens: false, balance: 0 };
    }

    // Demo: Kun disse specifikke test-adresser har $PUMPFLIP tokens
    const testWalletsWithTokens = [
      '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', // Test wallet 1
      '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',  // Test wallet 2
      'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7Profe7KeeYu',  // Test wallet 3
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',   // Test wallet 4
    ];

    const hasTokens = testWalletsWithTokens.includes(walletAddress);
    
    if (hasTokens) {
      // Forskellige balancer for hver test wallet
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

  isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}

export const solanaService = new SolanaService();
