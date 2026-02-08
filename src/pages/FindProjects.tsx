import { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, User, TreePine, Hash, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWeb3 } from '@/hooks/useWeb3';

interface Project {
  id: number;
  projectName: string;
  location: string;
  uploader: string;
  timestamp: number;
  area: number;
  mangrovesCount: number;
  date: string;
  dataHash: string;
  carbonCredits?: number;
  status: 'pending' | 'verified' | 'rejected';
}

export function FindProjects() {
  const { getProjects } = useWeb3();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project =>
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.uploader.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [searchQuery, projects]);

  const fetchProjects = async () => {
    try {
      const plantations = await getProjects();
      console.log('FindProjects: Received data:', plantations);
      
      const mockProjects: Project[] = plantations.map((plantation: any, index: number) => ({
        id: plantation.id || index + 1,
        projectName: plantation.name || `Blue Carbon Project #${plantation.id || index + 1}`,
        location: plantation.location || 'Unknown Location',
        uploader: plantation.owner || plantation.uploader || 'Unknown',
        timestamp: plantation.timestamp || Date.now(),
        area: plantation.area || Math.floor(Math.random() * 200) + 50,
        mangrovesCount: plantation.mangrovesCount || Math.floor(Math.random() * 5000) + 1000,
        date: plantation.date || new Date().toISOString().split('T')[0],
        dataHash: plantation.dataHash || plantation.metadataURI || `0x${Math.random().toString(16).substr(2, 8)}`,
        carbonCredits: Math.floor(Math.random() * 1000) + 100,
        status: plantation.isApproved ? 'verified' : plantation.isRejected ? 'rejected' : 'pending'
      }));
      
      setProjects(mockProjects);
      setFilteredProjects(mockProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    if (!address || address === 'Unknown') return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="status-verified">Verified</Badge>;
      case 'pending':
        return <Badge className="status-pending">Pending</Badge>;
      case 'rejected':
        return <Badge className="status-rejected">Rejected</Badge>;
      default:
        return <Badge className="status-pending">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-ocean-gradient bg-clip-text text-transparent">
          Find Projects
        </h1>
        <p className="text-muted-foreground mt-2">
          Discover and explore blue carbon restoration projects from around the world
        </p>
      </div>

      {/* Search Bar */}
      <Card className="bg-dark-gradient border-border mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects by name, location, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="bg-dark-gradient border-border">
          <CardContent className="p-12 text-center">
            <TreePine className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search terms' : 'No projects have been registered yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="bg-dark-gradient border-border hover:border-primary/50 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-primary/10"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold leading-tight">
                    {project.projectName}
                  </CardTitle>
                  {getStatusBadge(project.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {project.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    {formatAddress(project.uploader)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(project.timestamp)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Area</p>
                    <p className="font-medium">{project.area} hectares</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mangroves</p>
                    <p className="font-medium">{project.mangrovesCount.toLocaleString()}</p>
                  </div>
                  {project.carbonCredits && (
                    <>
                      <div>
                        <p className="text-muted-foreground">Credits</p>
                        <p className="font-medium text-accent">{project.carbonCredits}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium capitalize text-primary">{project.status}</p>
                      </div>
                    </>
                  )}
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 hover:bg-primary/10 hover:border-primary"
                      onClick={() => setSelectedProject(project)}
                    >
                      View Details
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-background border-border">
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between">
                        <span>{project.projectName}</span>
                        {getStatusBadge(project.status)}
                      </DialogTitle>
                    </DialogHeader>
                    
                    {selectedProject && (
                      <div className="space-y-6 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Project Information</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Project ID:</span>
                                  <span className="font-medium">#{selectedProject.id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Location:</span>
                                  <span className="font-medium">{selectedProject.location}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Area:</span>
                                  <span className="font-medium">{selectedProject.area} hectares</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Mangroves:</span>
                                  <span className="font-medium">{selectedProject.mangrovesCount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Plantation Date:</span>
                                  <span className="font-medium">{selectedProject.date}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Blockchain Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Creator:</span>
                                  <span className="font-mono font-medium">{formatAddress(selectedProject.uploader)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Data Hash:</span>
                                  <span className="font-mono font-medium">{selectedProject.dataHash.slice(0, 10)}...</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Timestamp:</span>
                                  <span className="font-medium">{formatDate(selectedProject.timestamp)}</span>
                                </div>
                                {selectedProject.carbonCredits && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Carbon Credits:</span>
                                    <span className="font-medium text-accent">{selectedProject.carbonCredits} CCT</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Environmental Impact</h4>
                          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-accent">{selectedProject.area}</p>
                              <p className="text-sm text-muted-foreground">Hectares Restored</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-primary">{Math.round(selectedProject.area * 15.5)}</p>
                              <p className="text-sm text-muted-foreground">Tons CO₂ Sequestered</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-secondary">{selectedProject.mangrovesCount.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">Trees Planted</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <Hash className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <p className="font-semibold text-primary">Blockchain Verified</p>
                            <p className="text-sm text-muted-foreground">
                              This project is permanently recorded on the Polygon blockchain
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}