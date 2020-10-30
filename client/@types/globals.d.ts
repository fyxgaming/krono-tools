import { WalletService } from '../src/services/wallet-service';

declare global {
    interface Window { 
        walletService: WalletService;
    }
}