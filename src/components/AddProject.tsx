import { useState } from 'react';
import { MapPin, Upload, FileText, TreePine, Info, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWeb3 } from '@/hooks/useWeb3';
import { useToast } from '@/hooks/use-toast';
import { ProjectMap } from '@/components/ProjectMap';

interface ProjectFormData {
  projectName: string;
  projectDescription: string;
  location: string;
  latitude: string;
  longitude: string;
  area: string;
  mangrovesCount: string;
  date: string;
  contactEmail: string;
  verificationDocument: File | null;
}

export function AddProject() {
  const { account, signer, registerProject } = useWeb3();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: '',
    projectDescription: '',
    location: '',
    latitude: '',
    longitude: '',
    area: '',
    mangrovesCount: '',
    date: '',
    contactEmail: '',
    verificationDocument: null
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      verificationDocument: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account || !signer) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to register a plantation",
        variant: "destructive",
      });
      return;
    }

    if (!formData.projectName || !formData.location || !formData.latitude || !formData.longitude || 
        !formData.area || !formData.mangrovesCount || !formData.date || !formData.contactEmail) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tx = await registerProject(
        formData.projectName,
        formData.projectDescription,
        formData.location,
        parseFloat(formData.latitude),
        parseFloat(formData.longitude),
        parseInt(formData.area) // Using area as credits requested for now
      );
      
      toast({
        title: "Plantation Registered Successfully",
        description: `Transaction hash: ${tx.hash}`,
      });

      // Reset form
      setFormData({
        projectName: '',
        projectDescription: '',
        location: '',
        latitude: '',
        longitude: '',
        area: '',
        mangrovesCount: '',
        date: '',
        contactEmail: '',
        verificationDocument: null
      });
      
    } catch (error: any) {
      console.error('Error registering plantation:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register plantation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-ocean-gradient bg-clip-text text-transparent">
          Register Blue Carbon Project
        </h1>
        <p className="text-muted-foreground mt-2">
          Submit your coastal restoration project for verification and carbon credit tokenization
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Information Section */}
        <Card className="bg-dark-gradient border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 text-accent mr-2" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  placeholder="e.g., Sundarbans Mangrove Restoration"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label htmlFor="area">Area (Hectares) *</Label>
                <Input
                  id="area"
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="e.g., 156"
                  className="bg-background border-border"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="projectDescription">Project Description</Label>
              <Textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                placeholder="Describe your blue carbon project, its objectives, and expected outcomes..."
                className="bg-background border-border min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mangrovesCount">Number of Mangroves *</Label>
                <Input
                  id="mangrovesCount"
                  type="number"
                  value={formData.mangrovesCount}
                  onChange={(e) => handleInputChange('mangrovesCount', e.target.value)}
                  placeholder="e.g., 5000"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label htmlFor="date">Plantation Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Details Section */}
        <Card className="bg-dark-gradient border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 text-accent mr-2" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location">Location Description *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., West Bengal, India - Sundarbans Delta Region"
                className="bg-background border-border"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  placeholder="e.g., 21.9497"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  placeholder="e.g., 88.2666"
                  className="bg-background border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Details Section */}
        <Card className="bg-dark-gradient border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 text-accent mr-2" />
              Organization Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="contact@organization.org"
                className="bg-background border-border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Verification Documents Section */}
        <Card className="bg-dark-gradient border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 text-accent mr-2" />
              Verification Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="verificationDocument">Upload Supporting Documents</Label>
              <div className="mt-2">
                <label htmlFor="verificationDocument" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, PNG (MAX. 10MB)</p>
                  </div>
                  <input
                    id="verificationDocument"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
                {formData.verificationDocument && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: {formData.verificationDocument.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Map Section */}
        <ProjectMap 
          latitude={formData.latitude} 
          longitude={formData.longitude}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!account || isSubmitting}
            className="bg-ocean-gradient hover:opacity-90 text-white px-8"
          >
            {isSubmitting ? 'Registering...' : 'Register Plantation'}
          </Button>
        </div>
      </form>
    </div>
  );
}