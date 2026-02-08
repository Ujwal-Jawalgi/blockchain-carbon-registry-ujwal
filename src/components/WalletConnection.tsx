import { Wallet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/hooks/useWeb3';
import { Badge } from '@/components/ui/badge';

export function WalletConnection() {
  const { account, isConnecting, connectWallet, disconnectWallet } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (account) {
    return (
      <div className="flex items-center space-x-3">
        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
          <div className="w-2 h-2 bg-accent rounded-full mr-2" />
          Connected
        </Badge>
        <div className="text-sm">
          <div className="font-medium">{formatAddress(account)}</div>
          <div className="text-xs text-muted-foreground">Polygon Amoy Testnet</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnectWallet}
          className="h-8 w-8 p-0"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="bg-ocean-gradient hover:opacity-90 text-white"
    >
      <Wallet className="h-4 w-4 mr-2" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}