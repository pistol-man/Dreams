import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { PredictionData } from '@/types/predictions';

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
        // Convert string values to numbers
        const severity = parseFloat(point.Predicted_Severity_Scale);
        const density = parseFloat(point.Population_Density);
        const lat = parseFloat(point.latitude);
        const lng = parseFloat(point.longitude);
        
        // Normalize severity (0-10) to 0-1
        const severityFactor = severity / 10;
        // Normalize population density (0-60000) to 0-1
        const densityFactor = density / 60000;
        // Combine factors for intensity (giving more weight to severity)
        const intensity = (severityFactor * 0.7 + densityFactor * 0.3) * 2;
        
        return [
          lat,
          lng,
          intensity
        ] as [number, number, number];
      });

      // Remove existing heatmap layer if it exists
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }

      // Add new heatmap layer with Snapchat-style colors
      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 30, // Larger radius for better coverage
        blur: 20, // Moderate blur for smooth transitions
        maxZoom: 11,
        minOpacity: 0.3, // Lower minimum opacity for better contrast
        max: 1.0, // Normalized max value
        gradient: {
          0.0: 'rgba(255, 255, 255, 0)', // transparent
          0.2: 'rgba(255, 253, 212, 0.8)', // light yellow
          0.3: 'rgba(255, 240, 150, 0.9)', // yellow
          0.4: 'rgba(255, 220, 110, 0.9)', // warm yellow
          0.5: 'rgba(255, 200, 70, 0.9)',  // orange-yellow
          0.6: 'rgba(255, 180, 50, 0.9)',  // light orange
          0.7: 'rgba(255, 150, 30, 0.9)',  // orange
          0.8: 'rgba(255, 120, 20, 0.9)',  // dark orange
          0.9: 'rgba(255, 80, 10, 0.9)',   // red-orange
          1.0: 'rgba(255, 40, 0, 1.0)'     // bright red
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