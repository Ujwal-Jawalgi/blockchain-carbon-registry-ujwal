import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  ExternalLink, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Calendar,
  Hash,
  MapPin,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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

interface TransactionHistoryProps {
  provider: ethers.BrowserProvider | null;
}

const BLUE_CARBON_REGISTRY_ADDRESS = '0xc48584c791c830bf91a2ec6cec7be984e45cc726';

// PlantationAdded event ABI
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

const ITEMS_PER_PAGE = 10;

export function TransactionHistory({ provider }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedDataHash, setExpandedDataHash] = useState<string | null>(null);
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

      // Get current block number
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 100000); // Last ~100k blocks

      // Fetch PlantationAdded events
      const filter = contract.filters.PlantationAdded();
      const events = await contract.queryFilter(filter, fromBlock, 'latest');

      const transactionPromises = events.map(async (event) => {
        const block = await provider.getBlock(event.blockNumber);
        // Type guard to ensure we have an EventLog with args
        if ('args' in event) {
          return {
            transactionHash: event.transactionHash,
            plantationId: event.args[0].toString(),
            location: event.args[1],
            dataHash: event.args[2],
            uploader: event.args[3],
            timestamp: block?.timestamp || 0,
            blockNumber: event.blockNumber,
          };
        }
        return null;
      }).filter(Boolean);

      const transactionData = (await Promise.all(transactionPromises)).filter((tx): tx is Transaction => tx !== null);
      
      // Sort by timestamp (newest first)
      transactionData.sort((a, b) => b.timestamp - a.timestamp);
      
      setTransactions(transactionData);
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

  const setupRealTimeListener = () => {
    if (!provider) return;

    const contract = new ethers.Contract(
      BLUE_CARBON_REGISTRY_ADDRESS,
      PLANTATION_ADDED_EVENT_ABI,
      provider
    );

    const filter = contract.filters.PlantationAdded();
    
    const handleNewPlantation = async (id: any, location: string, dataHash: string, uploader: string, event: any) => {
      try {
        const block = await provider.getBlock(event.blockNumber);
        const newTransaction: Transaction = {
          transactionHash: event.transactionHash,
          plantationId: id.toString(),
          location,
          dataHash,
          uploader,
          timestamp: block?.timestamp || 0,
          blockNumber: event.blockNumber,
        };

        setTransactions(prev => [newTransaction, ...prev]);
        
        toast({
          title: "New Plantation Added",
          description: `Plantation #${id.toString()} has been registered`,
        });
      } catch (error) {
        console.error('Error processing new plantation event:', error);
      }
    };

    contract.on(filter, handleNewPlantation);

    return () => {
      contract.removeAllListeners(filter);
    };
  };

  useEffect(() => {
    fetchTransactions();
    const cleanup = setupRealTimeListener();
    
    return cleanup;
  }, [provider]);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDataHash = (hash: string, isExpanded: boolean) => {
    if (isExpanded) return hash;
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 6)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const getPolygonscanUrl = (txHash: string) => {
    return `https://www.oklink.com/amoy/tx/${txHash}`;
  };

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const getPaginationRange = () => {
    const range = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          range.push(i);
        }
        range.push('...');
        range.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        range.push(1);
        range.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          range.push(i);
        }
      } else {
        range.push(1);
        range.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          range.push(i);
        }
        range.push('...');
        range.push(totalPages);
      }
    }
    
    return range;
  };

  return (
    <Card className="bg-dark-gradient border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Hash className="h-5 w-5 text-accent mr-2" />
            Transaction History
          </CardTitle>
          <Button
            onClick={fetchTransactions}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-border hover:bg-accent/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Hash className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">No plantations have been registered yet 🚀</h3>
            <p className="text-sm">
              Transaction history will appear here once plantations are added to the registry.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total transactions: {transactions.length}</span>
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                <div className="w-2 h-2 bg-accent rounded-full mr-2" />
                Live Updates Active
              </Badge>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Transaction</TableHead>
                    <TableHead className="text-muted-foreground">Plantation ID</TableHead>
                    <TableHead className="text-muted-foreground">Location</TableHead>
                    <TableHead className="text-muted-foreground">Data Hash</TableHead>
                    <TableHead className="text-muted-foreground">Uploader</TableHead>
                    <TableHead className="text-muted-foreground">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTransactions.map((tx) => (
                    <TableRow key={tx.transactionHash} className="border-border hover:bg-accent/5">
                      <TableCell>
                        <a
                          href={getPolygonscanUrl(tx.transactionHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:text-primary-glow transition-colors"
                        >
                          <span className="font-mono text-sm">
                            {formatAddress(tx.transactionHash)}
                          </span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary/20 text-primary">
                          #{tx.plantationId}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 text-muted-foreground mr-1" />
                          <span className="text-sm">{tx.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <button
                            onClick={() => setExpandedDataHash(
                              expandedDataHash === tx.transactionHash ? null : tx.transactionHash
                            )}
                            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <span className="font-mono text-xs">
                              {formatDataHash(tx.dataHash, expandedDataHash === tx.transactionHash)}
                            </span>
                            {expandedDataHash === tx.transactionHash ? (
                              <EyeOff className="h-3 w-3 ml-1" />
                            ) : (
                              <Eye className="h-3 w-3 ml-1" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-3 w-3 text-muted-foreground mr-1" />
                          <span className="font-mono text-sm">{formatAddress(tx.uploader)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-muted-foreground mr-1" />
                          <span className="text-sm">{formatTimestamp(tx.timestamp)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {getPaginationRange().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === '...' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => setCurrentPage(page as number)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}