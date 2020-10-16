import type { WalletService } from '../services/wallet-service';
declare const walletService: WalletService;

export class GlobalService {
    get wallet(): WalletService { return walletService; }
}