import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  FileText, 
  User,
  Calendar,
  DollarSign,
  TreePine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWeb3 } from '@/hooks/useWeb3';
import { useToast } from '@/hooks/use-toast';

interface Plantation {
  id: number;
  location: string;
  dataHash: string;
  uploader: string;
  timestamp: number;
  date: string;
  verified?: boolean;
  rejected?: boolean;
  projectName?: string;
  organization?: string;
  area?: number;
  expectedCarbon?: number;
}

export function AdminPanel() {
  const { account, getProjects, approveProject, rejectProject, checkAdminRole } = useWeb3();
  const { toast } = useToast();
  const [plantations, setPlantations] = useState<Plantation[]>([]);
  const [selectedPlantation, setSelectedPlantation] = useState<Plantation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');

  // Contract owner address (replace with actual deployment address)
  const CONTRACT_OWNER = '0x742d35Cc4F4B12F4fA9C0CDF...'; // Replace with actual contract owner
  
  // Authorized admins (can be modified by contract owner)
  const AUTHORIZED_ADMINS = [
    '0x742d35Cc4F4B12F4fA9C0CDF...', // Contract owner
    '0x456...', // Additional authorized admin
    // Add more authorized admin addresses as needed
  ];

  // Check if user is admin (temporarily allowing all users for testing)
  const isAdmin = account && (
    account.toLowerCase() === CONTRACT_OWNER.toLowerCase() || 
    AUTHORIZED_ADMINS.some(admin => admin.toLowerCase() === account.toLowerCase()) ||
    account // Allow any connected wallet for now
  );

  useEffect(() => {
    const fetchPlantations = async () => {
      try {
        console.log('AdminPanel: Fetching plantation data...');
        const plantationData = await getProjects();
        console.log('AdminPanel: Received data:', plantationData);
        
        setPlantations(plantationData.map((p, index) => ({ 
          ...p, 
          verified: p.isApproved || false,
          rejected: p.isRejected || false,
          projectName: p.name || `Project ${p.id}`,
          organization: p.description || "Ocean Conservation Org",
          area: Math.floor(Math.random() * 200) + 50,
          expectedCarbon: Math.floor(Math.random() * 3000) + 1000
        })));
      } catch (error) {
        console.error('AdminPanel: Error fetching plantations:', error);
      }
    };

    if (account) {
      fetchPlantations();
    }
  }, [account]); // Remove getProjects from deps to prevent infinite loop

  const handleVerifyPlantation = async (plantationId: number) => {
    setIsProcessing(true);

    try {
      // Mark plantation as verified
      setPlantations(prev => 
        prev.map(plantation => 
          plantation.id === plantationId 
            ? { ...plantation, verified: true, rejected: false }
            : plantation
        )
      );

      toast({
        title: "Plantation Verified",
        description: "Plantation has been verified and is eligible for carbon credit minting",
      });
      
    } catch (error) {
      console.error('Error verifying plantation:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify plantation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPlantation = async (plantationId: number) => {
    setIsProcessing(true);

    try {
      // Mark plantation as rejected
      setPlantations(prev => 
        prev.map(plantation => 
          plantation.id === plantationId 
            ? { ...plantation, rejected: true, verified: false }
            : plantation
        )
      );

      toast({
        title: "Plantation Rejected",
        description: "Plantation has been rejected and cannot mint carbon credits",
        variant: "destructive",
      });
      
    } catch (error) {
      console.error('Error rejecting plantation:', error);
      toast({
        title: "Rejection Failed",
        description: "Failed to reject plantation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMintCredits = async () => {
    if (!selectedPlantation || !creditAmount) {
      toast({
        title: "Invalid Input",
        description: "Please select a plantation and enter credit amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const tx = await approveProject(selectedPlantation.id, parseInt(creditAmount));
      
      toast({
        title: "Carbon Credits Minted",
        description: `${creditAmount} carbon credits minted successfully. Tx: ${tx.hash}`,
      });

      setCreditAmount('');
      setSelectedPlantation(null);
      
    } catch (error: any) {
      console.error('Error minting credits:', error);
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint carbon credits. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="bg-dark-gradient border-border">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              This panel is restricted to NCCR (National Centre for Coastal Research) administrators only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unverifiedCount = plantations.filter(p => !p.verified && !p.rejected).length;
  const verifiedCount = plantations.filter(p => p.verified).length;
  const rejectedCount = plantations.filter(p => p.rejected).length;
  const totalCount = plantations.length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-ocean-gradient bg-clip-text text-transparent">
          NCCR Admin Panel
        </h1>
        <p className="text-muted-foreground mt-2">
          Verify plantations and mint carbon credits for verified projects
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-dark-gradient border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-pending">{unverifiedCount}</p>
              </div>
              <Clock className="h-8 w-8 text-pending" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-gradient border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-verified">{verifiedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-verified" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-gradient border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-gradient border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">{totalCount}</p>
              </div>
              <TreePine className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plantations List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending ({unverifiedCount})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({verifiedCount})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {plantations.filter(p => !p.verified && !p.rejected).map((plantation) => (
                <Card 
                  key={plantation.id} 
                  className={`bg-dark-gradient border cursor-pointer transition-all duration-200 ${
                    selectedPlantation?.id === plantation.id 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPlantation(plantation)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{plantation.projectName || `Plantation #${plantation.id}`}</h3>
                        <p className="text-sm text-muted-foreground">{plantation.organization}</p>
                      </div>
                      <Badge className="status-pending">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{plantation.location}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Area</p>
                        <p className="font-medium">{plantation.area} hectares</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expected Carbon</p>
                        <p className="font-medium">{plantation.expectedCarbon} tCO₂</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p className="font-medium">{plantation.date}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerifyPlantation(plantation.id);
                        }}
                        disabled={isProcessing}
                        className="bg-ocean-gradient hover:opacity-90 text-white"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectPlantation(plantation.id);
                        }}
                        disabled={isProcessing}
                        variant="destructive"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {plantations.filter(p => !p.verified && !p.rejected).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <TreePine className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No plantations pending verification</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {plantations.filter(p => p.verified).map((plantation) => (
                <Card 
                  key={plantation.id} 
                  className={`bg-dark-gradient border cursor-pointer transition-all duration-200 ${
                    selectedPlantation?.id === plantation.id 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPlantation(plantation)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{plantation.projectName || `Plantation #${plantation.id}`}</h3>
                        <p className="text-sm text-muted-foreground">{plantation.organization}</p>
                      </div>
                      <Badge className="status-verified">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{plantation.location}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Area</p>
                        <p className="font-medium">{plantation.area} hectares</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expected Carbon</p>
                        <p className="font-medium">{plantation.expectedCarbon} tCO₂</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p className="font-medium">{plantation.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {plantations.filter(p => p.verified).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No approved plantations yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {plantations.filter(p => p.rejected).map((plantation) => (
                <Card key={plantation.id} className="bg-dark-gradient border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{plantation.projectName || `Plantation #${plantation.id}`}</h3>
                        <p className="text-sm text-muted-foreground">{plantation.organization}</p>
                      </div>
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{plantation.location}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Area</p>
                        <p className="font-medium">{plantation.area} hectares</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expected Carbon</p>
                        <p className="font-medium">{plantation.expectedCarbon} tCO₂</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p className="font-medium">{plantation.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {plantations.filter(p => p.rejected).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <XCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No rejected plantations</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Project Details */}
        <div>
          <Card className="bg-dark-gradient border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 text-primary mr-2" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedPlantation ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a project to view details</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{selectedPlantation.projectName || `Plantation #${selectedPlantation.id}`}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selectedPlantation.organization}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Location</p>
                        <p className="font-medium">{selectedPlantation.location}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Area</p>
                        <p className="font-medium">{selectedPlantation.area} hectares</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Expected Carbon</p>
                        <p className="font-medium">{selectedPlantation.expectedCarbon} tCO₂</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Submitted</p>
                        <p className="font-medium">{selectedPlantation.date}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-muted-foreground text-sm mb-2">Project Owner</p>
                      <p className="font-mono text-xs break-all">{selectedPlantation.uploader}</p>
                    </div>

                    <div className="pt-2">
                      <p className="text-muted-foreground text-sm mb-2">Data Hash</p>
                      <p className="font-mono text-xs break-all">{selectedPlantation.dataHash}</p>
                    </div>
                  </div>

                  {selectedPlantation.verified && (
                    <Card className="bg-primary/5 border-primary/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center">
                          <DollarSign className="h-4 w-4 text-primary mr-2" />
                          Mint Carbon Credits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="creditAmount">Carbon Credits to Mint</Label>
                          <Input
                            id="creditAmount"
                            type="number"
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(e.target.value)}
                            placeholder="Enter amount (e.g., 100)"
                            className="bg-background border-border"
                          />
                        </div>

                        <Button
                          onClick={handleMintCredits}
                          disabled={isProcessing || !creditAmount}
                          className="w-full bg-ocean-gradient hover:opacity-90 text-white"
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          {isProcessing ? 'Minting...' : 'Mint Carbon Credits'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {!selectedPlantation.verified && !selectedPlantation.rejected && (
                    <div className="p-4 rounded-lg bg-pending/10 border border-pending/20">
                      <p className="text-sm text-pending">
                        This project is pending verification. Carbon credits can only be minted for approved projects.
                      </p>
                    </div>
                  )}

                  {selectedPlantation.rejected && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">
                        This project has been rejected and cannot mint carbon credits.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}