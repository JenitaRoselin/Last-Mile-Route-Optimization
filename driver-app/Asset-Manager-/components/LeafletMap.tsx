import React from "react";
import { Platform, View, StyleSheet } from "react-native";

interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  color: string;
  type?: "order" | "fuel" | "break" | "driver";
}

interface LeafletMapProps {
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  style?: any;
  showRoute?: boolean;
}

function getLeafletHTML(props: LeafletMapProps): string {
  const { markers = [], center = { lat: 13.0827, lng: 80.2707 }, zoom = 13, showRoute = false } = props;

  const markerJS = markers
    .map((m) => {
      const iconColor = m.color || "#2563EB";
      const iconSvg = m.type === "driver"
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${iconColor}" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8l4 8H8l4-8z" fill="white" stroke="none"/></svg>`
        : m.type === "fuel"
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="white" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 10l4-4 4 4" fill="none" stroke="white" stroke-width="2"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${iconColor}"/><circle cx="12" cy="12" r="6" fill="white"/></svg>`;

      return `
        (function() {
          var icon = L.divIcon({
            html: '${iconSvg.replace(/'/g, "\\'")}',
            className: 'custom-marker',
            iconSize: [${m.type === "driver" ? "32, 32" : "28, 40"}],
            iconAnchor: [${m.type === "driver" ? "16, 16" : "14, 40"}],
            popupAnchor: [0, ${m.type === "driver" ? "-20" : "-42"}]
          });
          L.marker([${m.lat}, ${m.lng}], { icon: icon })
            .addTo(map)
            .bindPopup('<b>${m.label.replace(/'/g, "\\'")}</b>');
        })();
      `;
    })
    .join("\n");

  const routeJS = showRoute && markers.length >= 2
    ? `
      var routeCoords = [${markers.map((m) => `[${m.lat}, ${m.lng}]`).join(",")}];
      L.polyline(routeCoords, { color: '#2563EB', weight: 4, opacity: 0.7, dashArray: '8, 8' }).addTo(map);
    `
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
    .custom-marker { background: none !important; border: none !important; }
    .leaflet-popup-content-wrapper { border-radius: 10px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [${center.lat}, ${center.lng}],
      zoom: ${zoom},
      zoomControl: true,
      attributionControl: false
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);
    ${markerJS}
    ${routeJS}
  </script>
</body>
</html>`;
}

export default function LeafletMap(props: LeafletMapProps) {
  const html = getLeafletHTML(props);

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, props.style]}>
        <iframe
          srcDoc={html}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Map"
        />
      </View>
    );
  }

  const WebView = require("react-native-webview").default;
  return (
    <View style={[styles.container, props.style]}>
      <WebView
        source={{ html }}
        style={{ flex: 1 }}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
});
