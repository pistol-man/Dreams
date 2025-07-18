'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { HeatMapPoint } from '@/types/map';

// Extend window interface to include L.heatLayer
declare global {
  interface Window {
    L: typeof L & {
      heatLayer: (latlngs: L.LatLngExpression[], options?: any) => L.Layer;
    }
  }
}

interface WomenSafetyMapProps {
  className?: string;
}

// HeatmapLayer component to handle the heatmap functionality
const HeatmapLayer = () => {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);

  // Sample heatmap data based on your dashboard alerts
  const heatmapData: HeatMapPoint[] = [
    { lat: 19.0596, lng: 72.8295, intensity: 1 }, // Bandra West
    { lat: 19.1136, lng: 72.8697, intensity: 1 }, // Andheri East
    { lat: 18.9067, lng: 72.8147, intensity: 1 }, // Colaba
    { lat: 19.1075, lng: 72.8263, intensity: 1 }, // Juhu Beach
    { lat: 19.0178, lng: 72.8478, intensity: 1 }, // Dadar West
  ];

  useEffect(() => {
    // Ensure the script is loaded
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet.heat/dist/leaflet-heat.js';
    script.async = true;
    script.onload = () => {
      if (!heatLayerRef.current && window.L.heatLayer) {
        const heatData = heatmapData.map(point => [
          point.lat,
          point.lng,
          point.intensity
        ] as [number, number, number]);

        heatLayerRef.current = (window.L.heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 15,
          max: 1.0,
          gradient: {
            0.4: 'blue',
            0.6: 'yellow',
            0.8: 'orange',
            1.0: 'red'
          }
        })).addTo(map);
      }
    };
    document.head.appendChild(script);

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      document.head.removeChild(script);
    };
  }, [map]);

  return null;
};

const WomenSafetyMap = ({ className }: WomenSafetyMapProps) => {
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
        zoom={13}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
        zoomControl={true}
        attributionControl={true}
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

export default WomenSafetyMap; 