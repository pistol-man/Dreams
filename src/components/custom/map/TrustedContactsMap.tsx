import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  avatar?: string;
  imageFile?: string;
  distance?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

interface TrustedContactsMapProps {
  className?: string;
  trustedContacts: TrustedContact[];
}

// Combined Layer component to handle both heatmap and trusted contacts
const CombinedLayer = ({ trustedContacts }: { trustedContacts: TrustedContact[] }) => {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

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

      // Clear existing markers
      markersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      markersRef.current = [];

      // Create custom icon for trusted contacts with better sizing
      const createCustomIcon = (imageUrl: string) => {
        return L.divIcon({
          html: `
            <div class="relative inline-block">
              <div class="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                <img src="${imageUrl}" alt="contact" class="w-full h-full object-cover" style="border-radius: 50%;" />
              </div>
              <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          `,
          className: 'custom-marker',
          iconSize: [64, 64],
          iconAnchor: [32, 64],
          popupAnchor: [0, -64]
        });
      };

      // Add markers for each trusted contact with varied positions
      trustedContacts.forEach((contact, index) => {
        // Add slight variation to positions to avoid straight line
        const latVariation = (index - 1.5) * 0.002; // Spread contacts around
        const lngVariation = (index - 1.5) * 0.003;
        
        const adjustedLat = contact.location.lat + latVariation;
        const adjustedLng = contact.location.lng + lngVariation;
        
        const icon = createCustomIcon(contact.imageFile || contact.avatar || '');
        const marker = L.marker([adjustedLat, adjustedLng], { icon })
          .bindPopup(`
            <div class="p-4 min-w-[250px]">
              <div class="flex items-center gap-4 mb-4">
                <img src="${contact.imageFile || contact.avatar || ''}" alt="${contact.name}" class="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                <div>
                  <h3 class="font-semibold text-lg text-gray-900">${contact.name}</h3>
                  <p class="text-sm text-gray-600">${contact.relationship}</p>
                </div>
              </div>
              <div class="space-y-3 text-sm">
                <div class="flex items-center gap-3">
                  <span class="text-blue-600 text-lg">📞</span>
                  <span class="text-gray-700">${contact.phone}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-green-600 text-lg">📍</span>
                  <span class="text-gray-700">${contact.location.address}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-orange-600 text-lg">⏱️</span>
                  <span class="text-gray-700">${contact.distance} away</span>
                </div>
              </div>
              <div class="mt-4 pt-3 border-t border-gray-200">
                <button onclick="window.open('tel:${contact.phone}')" class="w-full bg-blue-500 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                  Call ${contact.name}
                </button>
              </div>
            </div>
          `, {
            maxWidth: 300,
            className: 'custom-popup'
          });

        marker.addTo(map);
        markersRef.current.push(marker);
      });

      // Fit map bounds to include all data points
      const allPoints = [
        ...heatData.map(point => [point[0], point[1]]),
        ...trustedContacts.map(contact => [contact.location.lat, contact.location.lng])
      ];
      
      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (error) {
      console.error("Error setting up combined layer:", error);
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      markersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      markersRef.current = [];
    };
  }, [map, trustedContacts]);

  return null;
};

const TrustedContactsMap: React.FC<TrustedContactsMapProps> = ({ className, trustedContacts }) => {
  // Bandra coordinates (Mumbai)
  const BANDRA_CENTER: [number, number] = [19.0596, 72.8295];

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
        center={BANDRA_CENTER}
        zoom={13}
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
        <CombinedLayer trustedContacts={trustedContacts} />
      </MapContainer>
    </div>
  );
};

export default TrustedContactsMap; 