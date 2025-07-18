// src/components/MyMap.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';

// Fix marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const heatmapPoints = [
  [19.0760, 72.8777, 0.9],
  [19.0896, 72.8656, 0.8],
  [19.1180, 72.8420, 0.7],
  [19.1310, 72.9167, 0.6],
  [19.0730, 72.8997, 0.5],
  [19.0213, 72.8424, 0.4],
];

// Add a photo property to each alert in your tableData (in page.tsx), e.g.:
// { id: 1, name: "Aarti Sharma", ..., lat: ..., lng: ..., photo: "/1.png" }

export default function MyMap({ alerts }: { alerts: { id: number, name: string, location: string, lat: number, lng: number, photo: string }[] }) {
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
      <MapContainer
        center={[19.0760, 72.8777]}
        zoom={12}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatmapLayer
          fitBoundsOnLoad
          fitBoundsOnUpdate
          points={heatmapPoints.map(([lat, lng, intensity]) => ({ lat, lng, intensity }))}
          longitudeExtractor={(m: any) => m.lng}
          latitudeExtractor={(m: any) => m.lat}
          intensityExtractor={(m: any) => m.intensity}
          radius={30}
          blur={20}
          max={1}
        />
        {alerts.map(alert => (
          <Marker
            key={alert.id}
            position={[alert.lat, alert.lng]}
            icon={L.divIcon({
              className: "custom-photo-marker",
              html: `
                <div style="
                  width: 56px;
                  height: 56px;
                  border-radius: 50%;
                  border: 3px solid #a259ff;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                  background: #fff;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  overflow: hidden;
                ">
                  <img src="${alert.photo}" alt="${alert.name}" style="width: 50px; height: 50px; border-radius: 50%;" />
                </div>
              `,
              iconSize: [56, 56],
              iconAnchor: [28, 56],
              popupAnchor: [0, -56],
            })}
          >
            <Popup>
              <b>{alert.name}</b><br />
              {alert.location}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
