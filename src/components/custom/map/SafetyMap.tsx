import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

interface PredictionData {
  Date: string;
  Predicted_Call_Category: string;
  District: string;
  State: string;
  Predicted_Severity_Scale: number;
  Population_Density: number;
  latitude: number;
  longitude: number;
  Special_Requirement: string;
  pincode: string;
}

interface SafetyMapProps {
  data: PredictionData[];
  className?: string;
}

// HeatmapLayer component to handle the heatmap functionality
const HeatmapLayer = ({ data }: { data: PredictionData[] }) => {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    try {
      // Create heatmap data points with enhanced intensity calculation
      const heatData = data.map(point => {
        // Enhanced severity factor with exponential scaling for higher values
        const severityFactor = Math.pow(point.Predicted_Severity_Scale / 10, 1.5);
        
        // Population density factor with higher weight
        const densityFactor = Math.pow(point.Population_Density / 60000, 1.2);
        
        // Combine factors with higher base intensity
        const baseIntensity = (severityFactor * 0.8 + densityFactor * 0.2);
        
        // Scale up the intensity and add minimum threshold
        const intensity = Math.max(baseIntensity * 3, 0.4);
        
        return [
          point.latitude,
          point.longitude,
          intensity
        ] as [number, number, number];
      });

      // Remove existing heatmap layer if it exists
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }

      // Add new heatmap layer with enhanced parameters
      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 45, // Larger radius for better coverage
        blur: 35, // Increased blur for smoother gradients
        maxZoom: 11,
        minOpacity: 0.45, // Higher minimum opacity
        max: 3.0, // Increased max value for more intense colors
        gradient: {
          0.0: 'rgba(255, 255, 255, 0)', // transparent
          0.2: '#fee2e2', // red-100
          0.4: '#fca5a5', // red-300
          0.6: '#f87171', // red-400
          0.8: '#ef4444', // red-500
          0.9: '#dc2626', // red-600
          1.0: '#991b1b'  // red-800
        }
      }).addTo(map);

      // Fit map bounds to data points with padding
      if (heatData.length > 0) {
        const bounds = L.latLngBounds(heatData.map(point => [point[0], point[1]]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (error) {
      console.error("Error setting up heatmap:", error);
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, data]);

  return null;
};

const SafetyMap: React.FC<SafetyMapProps> = ({ data, className }) => {
  // Mumbai coordinates
  const MUMBAI_CENTER: [number, number] = [19.0760, 72.8777];

  useEffect(() => {
    // Fix Leaflet icon issue
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className={className}>
      <MapContainer
        center={MUMBAI_CENTER}
        zoom={11}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        attributionControl={true}
        className="rounded-none"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
          maxZoom={19}
        />
        <HeatmapLayer data={data} />
      </MapContainer>
    </div>
  );
};

export default SafetyMap; 