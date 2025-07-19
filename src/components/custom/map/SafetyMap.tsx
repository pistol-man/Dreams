import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

interface SafetyMapProps {
  className?: string;
}

// HeatmapLayer component to handle the heatmap functionality
const HeatmapLayer = () => {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    try {
      // Heatmap data points
      const heatmapPoints = [
        { lat: 19.0760, lng: 72.8777, severity_scale: 4 },
        { lat: 19.2184, lng: 72.9780, severity_scale: 8 },
        { lat: 18.9750, lng: 72.8258, severity_scale: 7 },
        { lat: 19.1550, lng: 72.8460, severity_scale: 6 },
        { lat: 19.0176, lng: 72.8562, severity_scale: 3 },
        { lat: 28.6437, lng: 77.2249, severity_scale: 5 },
        { lat: 28.7041, lng: 77.1275, severity_scale: 8 },
        { lat: 28.5272, lng: 77.2090, severity_scale: 7 },
        { lat: 28.6139, lng: 77.2090, severity_scale: 2 },
        { lat: 12.9716, lng: 77.5946, severity_scale: 3 },
        { lat: 13.0827, lng: 77.5027, severity_scale: 7 },
        { lat: 12.9687, lng: 77.5675, severity_scale: 4 },
        { lat: 13.0827, lng: 80.2707, severity_scale: 4 },
        { lat: 12.9916, lng: 80.2279, severity_scale: 8 },
        { lat: 13.0355, lng: 80.2601, severity_scale: 9 },
        { lat: 13.0499, lng: 80.1700, severity_scale: 6 },
        { lat: 13.0604, lng: 80.2496, severity_scale: 5 },
        { lat: 19.0728, lng: 72.9072, severity_scale: 3 },
        { lat: 28.7041, lng: 77.1025, severity_scale: 5 },
        { lat: 28.6139, lng: 77.2090, severity_scale: 9 },
        { lat: 28.5272, lng: 77.2738, severity_scale: 7 },
        { lat: 28.6500, lng: 77.2300, severity_scale: 8 },
        { lat: 28.5700, lng: 77.3200, severity_scale: 2 },
        { lat: 13.0357, lng: 77.5343, severity_scale: 6 },
        { lat: 12.9141, lng: 77.6412, severity_scale: 9 },
        { lat: 12.9699, lng: 77.7498, severity_scale: 4 },
        { lat: 13.0067, lng: 80.2584, severity_scale: 8 },
        { lat: 13.0604, lng: 80.2496, severity_scale: 7 },
        { lat: 12.9900, lng: 80.2200, severity_scale: 3 },
      ];

      // Create heatmap data points with intensity based on severity
      const heatData = heatmapPoints.map(point => {
        // Normalize severity (0-10) to 0-1
        const severityFactor = point.severity_scale / 10;
        // Intensity based on severity
        const intensity = severityFactor * 2;
        
        return [
          point.lat,
          point.lng,
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
  }, [map]);

  return null;
};

const SafetyMap: React.FC<SafetyMapProps> = ({ className }) => {
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
        <HeatmapLayer />
      </MapContainer>
    </div>
  );
};

export default SafetyMap; 