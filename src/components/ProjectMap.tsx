import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Globe } from 'lucide-react';

interface ProjectMapProps {
  latitude: string;
  longitude: string;
  onMapboxTokenSubmit?: (token: string) => void;
}

export function ProjectMap({ latitude, longitude, onMapboxTokenSubmit }: ProjectMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(!mapboxgl.accessToken);
  const [mapInitialized, setMapInitialized] = useState(false);

  const initializeMap = (token: string) => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      projection: 'globe' as any,
      zoom: 1.5,
      center: [0, 20],
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add atmosphere and fog effects
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6,
      });
    });

    setMapInitialized(true);
    setShowTokenInput(false);
  };

  useEffect(() => {
    if (!mapInitialized || !map.current) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      // Remove existing marker
      if (marker.current) {
        marker.current.remove();
      }

      // Add new marker
      marker.current = new mapboxgl.Marker({ 
        color: '#3b82f6',
        scale: 1.2 
      })
        .setLngLat([lng, lat])
        .addTo(map.current);

      // Fly to location
      map.current.flyTo({
        center: [lng, lat],
        zoom: 12,
        pitch: 45,
        bearing: 0,
        duration: 2000
      });
    }
  }, [latitude, longitude, mapInitialized]);

  useEffect(() => {
    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      initializeMap(mapboxToken.trim());
      onMapboxTokenSubmit?.(mapboxToken.trim());
    }
  };

  if (showTokenInput) {
    return (
      <Card className="bg-dark-gradient border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 text-accent mr-2" />
            Project Location Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Setup Interactive Map</h3>
            <p className="text-muted-foreground mb-4">
              Enter your Mapbox public token to display the project location on an interactive globe.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Get your free token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
            </p>
            
            <div className="max-w-md mx-auto space-y-3">
              <div>
                <Label htmlFor="mapboxToken">Mapbox Public Token</Label>
                <Input
                  id="mapboxToken"
                  type="password"
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6..."
                  className="bg-background border-border"
                />
              </div>
              <Button 
                onClick={handleTokenSubmit}
                disabled={!mapboxToken.trim()}
                className="bg-ocean-gradient hover:opacity-90 text-white"
              >
                Initialize Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-gradient border-border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="h-5 w-5 text-accent mr-2" />
          Project Location Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-border">
          <div ref={mapContainer} className="absolute inset-0" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10 rounded-lg" />
          
          {!latitude || !longitude ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Enter coordinates to view location</p>
              </div>
            </div>
          ) : (
            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">{latitude}, {longitude}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}