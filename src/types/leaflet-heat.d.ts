import * as L from 'leaflet';

declare module 'leaflet' {
  interface HeatMapOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: { [key: number]: string };
  }

  interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: [number, number, number][]): void;
    addLatLng(latlng: [number, number, number]): void;
  }

  function heatLayer(
    latlngs: [number, number, number][],
    options?: HeatMapOptions
  ): HeatLayer;
} 