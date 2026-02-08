import { useEffect, useState } from 'react';
import { 
  TreePine, 
  MapPin, 
  Coins, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWeb3 } from '@/hooks/useWeb3';
import { ProjectsSection } from './ProjectsSection';
import { TransactionsSection } from './TransactionsSection';

interface ProjectStats {
  totalProjects: number;
  verifiedHectares: number;
  tokensMinted: number;
  pendingApprovals: number;
  totalStakeholders: number;
  monthlyGrowth: number;
}

interface Project {
  id: number;
  name: string;
  description: string;
  owner: string;
  status: number;
  creditsRequested: number;
  creditsApproved: number;
  timestamp: number;
  latitude: number;
  longitude: number;
  date: string;
}

export function Dashboard() {
  const { getProjects, carbonBalance, account, provider } = useWeb3();
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    verifiedHectares: 0,
    tokensMinted: 0,
    pendingApprovals: 0,
    totalStakeholders: 0,
    monthlyGrowth: 0
  });

  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // console.log('Dashboard: Fetching project data...'); // Removed to prevent spam
        const projectData = await getProjects();
        setProjects(projectData);
        
        // Update stats based on real data
        setStats({
          totalProjects: projectData.length,
          verifiedHectares: projectData.length * 100, // Mock calculation
          tokensMinted: parseFloat(carbonBalance || '0'),
          pendingApprovals: projectData.filter(p => p.status === 0).length, // Pending projects
          totalStakeholders: Math.floor(projectData.length * 0.8), // Mock stakeholders
          monthlyGrowth: 12.5 // Mock growth
        });
      } catch (error) {
        console.error('Dashboard: Error fetching data:', error);
      }
    };

    if (account) {
      fetchData();
    }
  }, [account, carbonBalance, getProjects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'status-verified';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-ocean-gradient bg-clip-text text-transparent">
          Blue Carbon Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor coastal restoration projects and carbon credit tokenization
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-dark-gradient border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <TreePine className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-gradient border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Hectares</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedHectares.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Coastal areas restored
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-gradient border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Credits</CardTitle>
            <Coins className="h-4 w-4 text-primary-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tokensMinted.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Tokens minted
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-gradient border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-dark-gradient border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 text-accent mr-2" />
              Carbon Impact Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>2024 Goal: 5,000 hectares</span>
                <span className="text-accent">{Math.round((stats.verifiedHectares / 5000) * 100)}%</span>
              </div>
              <Progress value={(stats.verifiedHectares / 5000) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Credits Target: 75,000</span>
                <span className="text-primary-glow">{Math.round((stats.tokensMinted / 75000) * 100)}%</span>
              </div>
              <Progress value={(stats.tokensMinted / 75000) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-gradient border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 text-primary mr-2" />
              Stakeholder Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-accent">{stats.totalStakeholders}</div>
                <p className="text-xs text-muted-foreground">Active Stakeholders</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">12</div>
                <p className="text-xs text-muted-foreground">NGOs Onboarded</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-primary-glow">34</div>
                <p className="text-xs text-muted-foreground">Community Groups</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-verified">43</div>
                <p className="text-xs text-muted-foreground">Coastal Panchayats</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Carbon Balance */}
      {account && (
        <Card className="bg-dark-gradient border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="h-5 w-5 text-primary-glow mr-2" />
              Your Carbon Credit Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="text-4xl font-bold text-primary-glow mb-2">
                {parseFloat(carbonBalance).toFixed(2)}
              </div>
              <p className="text-muted-foreground">Carbon Credits (CCT)</p>
              <p className="text-xs text-muted-foreground mt-2">
                Wallet: {account.substring(0, 6)}...{account.substring(-4)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Section */}
      <ProjectsSection plantations={projects} account={account} />

      {/* Transactions Section */}
      <TransactionsSection provider={provider} account={account} />
    </div>
  );
}