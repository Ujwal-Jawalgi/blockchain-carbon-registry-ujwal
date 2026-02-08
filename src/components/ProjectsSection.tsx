import { useState, useEffect } from 'react';
import { TreePine, MapPin, Coins, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useWeb3 } from '@/hooks/useWeb3';

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

interface ProjectsSectionProps {
  plantations: Project[];
  account: string | null;
}

export function ProjectsSection({ plantations, account }: ProjectsSectionProps) {
  const userPlantations = plantations.filter(p => 
    account && p.owner && p.owner.toLowerCase() === account.toLowerCase()
  );

  const formatAddress = (address: string) => {
    if (!address || typeof address !== 'string') return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const ProjectCard = ({ plantation }: { plantation: Project }) => (
    <Card className="bg-card border-border hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <TreePine className="h-5 w-5 text-accent mr-2" />
            {plantation.name}
          </CardTitle>
          <Badge className="status-verified">
            {plantation.status === 0 ? 'Pending' : plantation.status === 1 ? 'Approved' : 'Rejected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          {plantation.latitude}, {plantation.longitude}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="h-4 w-4 mr-2 text-accent" />
          {formatAddress(plantation.owner)}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2 text-primary-glow" />
          {plantation.date}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-sm">
            <Coins className="h-4 w-4 mr-1 text-primary-glow" />
            <span className="text-primary-glow font-medium">{plantation.creditsApproved || plantation.creditsRequested} CCT</span>
          </div>
          <div className="text-xs text-muted-foreground">
            ID: {plantation.id}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ isUserView }: { isUserView: boolean }) => (
    <div className="text-center py-12">
      <TreePine className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        {isUserView ? "No projects yet" : "No projects found"}
      </h3>
      <p className="text-muted-foreground">
        {isUserView 
          ? "Register your first plantation to get started"
          : "No plantations have been registered yet"
        }
      </p>
    </div>
  );

  return (
    <Card className="bg-dark-gradient border-border rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <TreePine className="h-6 w-6 text-accent mr-3" />
          Projects Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="your-projects" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-card">
            <TabsTrigger value="your-projects" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Your Projects
            </TabsTrigger>
            <TabsTrigger value="all-projects" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All Projects
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="your-projects" className="space-y-4">
            {userPlantations.length === 0 ? (
              <EmptyState isUserView={true} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userPlantations.map((plantation) => (
                  <ProjectCard key={plantation.id} plantation={plantation} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all-projects" className="space-y-4">
            {plantations.length === 0 ? (
              <EmptyState isUserView={false} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plantations.map((plantation) => (
                  <ProjectCard key={plantation.id} plantation={plantation} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}