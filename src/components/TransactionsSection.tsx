import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  Activity, 
  ExternalLink, 
  RefreshCw, 
  Calendar,
  Hash,
  User,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  transactionHash: string;
  plantationId: string;
  location: string;
  dataHash: string;
  uploader: string;
  timestamp: number;
  blockNumber: number;
}

interface TransactionsSectionProps {
  provider: ethers.BrowserProvider | null;
  account: string | null;
}

const BLUE_CARBON_REGISTRY_ADDRESS = '0xc48584c791c830bf91a2ec6cec7be984e45cc726';

const PLANTATION_ADDED_EVENT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "dataHash",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "uploader",
        "type": "address"
      }
    ],
    "name": "PlantationAdded",
    "type": "event"
  }
];

export function TransactionsSection({ provider, account }: TransactionsSectionProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    if (!provider) return;

    setLoading(true);
    try {
      const contract = new ethers.Contract(
        BLUE_CARBON_REGISTRY_ADDRESS,
        PLANTATION_ADDED_EVENT_ABI,
        provider
      );

      const filter = contract.filters.PlantationAdded();
      const logs = await contract.queryFilter(filter, 0, 'latest');

      const parsedTransactions: Transaction[] = await Promise.all(
        logs.map(async (log) => {
          const block = await provider.getBlock(log.blockNumber);
          const parsedLog = contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          });

          if (!parsedLog) {
            throw new Error('Failed to parse log');
          }

          return {
            transactionHash: log.transactionHash,
            plantationId: parsedLog.args.id.toString(),
            location: parsedLog.args.location,
            dataHash: parsedLog.args.dataHash,
            uploader: parsedLog.args.uploader,
            timestamp: block?.timestamp || 0,
            blockNumber: log.blockNumber
          };
        })
      );

      setTransactions(parsedTransactions.reverse());
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transaction history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [provider]);

  const userTransactions = transactions.filter(tx => 
    account && tx.uploader.toLowerCase() === account.toLowerCase()
  );

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const TimelineItem = ({ transaction }: { transaction: Transaction }) => (
    <div className="flex items-start space-x-4 p-4 rounded-lg bg-card/50 border border-border hover:bg-card/70 transition-colors">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
        <Activity className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-foreground">
            Plantation #{transaction.plantationId} registered
          </p>
          <Badge variant="outline" className="text-xs">
            {transaction.location}
          </Badge>
        </div>
        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(transaction.timestamp)}
          </span>
          <a
            href={`https://amoy.polygonscan.com/tx/${transaction.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-primary transition-colors"
          >
            <Hash className="h-3 w-3 mr-1" />
            {transaction.transactionHash.substring(0, 8)}...
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );

  const EmptyState = ({ isUserView }: { isUserView: boolean }) => (
    <div className="text-center py-12">
      <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        {isUserView ? "No transactions yet" : "No transactions found"}
      </h3>
      <p className="text-muted-foreground">
        {isUserView 
          ? "Your transactions will appear here once you start registering plantations"
          : "No transactions have been recorded yet"
        }
      </p>
    </div>
  );

  return (
    <Card className="bg-dark-gradient border-border rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-xl">
          <Activity className="h-6 w-6 text-primary mr-3" />
          Transaction History
        </CardTitle>
        <Button
          onClick={fetchTransactions}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="your-transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-card">
            <TabsTrigger value="your-transactions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Your Transactions
            </TabsTrigger>
            <TabsTrigger value="all-transactions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All Transactions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="your-transactions" className="space-y-4">
            {userTransactions.length === 0 ? (
              <EmptyState isUserView={true} />
            ) : (
              <div className="space-y-3">
                {userTransactions.map((transaction) => (
                  <TimelineItem key={transaction.transactionHash} transaction={transaction} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all-transactions" className="space-y-4">
            {transactions.length === 0 ? (
              <EmptyState isUserView={false} />
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-card/50">
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction, index) => (
                      <TableRow key={transaction.transactionHash} className={index % 2 === 0 ? 'bg-card/20' : 'bg-card/30'}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">
                              {formatAddress(transaction.uploader)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-primary" />
                            <span>Plantation #{transaction.plantationId}</span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.location}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(transaction.timestamp)}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`https://amoy.polygonscan.com/tx/${transaction.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-primary hover:text-primary-glow transition-colors"
                          >
                            <span className="font-mono text-sm">
                              {transaction.transactionHash.substring(0, 8)}...
                            </span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}