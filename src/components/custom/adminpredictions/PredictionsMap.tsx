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

interface PredictionsMapProps {
  data: PredictionData[];
  className?: string;
}

// HeatmapLayer component to handle the heatmap functionality
const HeatmapLayer = ({ data }: { data: PredictionData[] }) => {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    try {
      // Create heatmap data points with intensity based on severity and population density
      const heatData = data.map(point => {
        // Normalize severity (0-10) to 0-1
        const severityFactor = point.Predicted_Severity_Scale / 10;
        // Normalize population density (0-60000) to 0-1
        const densityFactor = point.Population_Density / 60000;
        // Combine factors for intensity (giving more weight to severity)
        const intensity = (severityFactor * 0.7 + densityFactor * 0.3) * 2; // Multiply by 2 to make it more visible
        
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

      // Add new heatmap layer with adjusted parameters
      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 40, // Increased radius for better visibility
        blur: 30, // Increased blur for smoother transitions
        maxZoom: 11,
        minOpacity: 0.4, // Minimum opacity to ensure visibility
        max: 2.0, // Increased max value to match our intensity scaling
        gradient: {
          0.0: '#3b82f6', // blue-500
          0.3: '#60a5fa', // blue-400
          0.5: '#fbbf24', // amber-400
          0.7: '#f97316', // orange-500
          1.0: '#ef4444'  // red-500
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

const PredictionsMap: React.FC<PredictionsMapProps> = ({ data, className }) => {
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
        style={{ width: '100%', height: '100%', minHeight: '800px' }}
        zoomControl={true}
        attributionControl={true}
        className="rounded-xl shadow-inner"
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

export default PredictionsMap; 