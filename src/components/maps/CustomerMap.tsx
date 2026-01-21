
import { useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapPin } from 'lucide-react';
import { Customer } from "@/types";

// ─── Premium Gold Marker ────────────────────────────────────────────────
const goldIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [32, 45],
  iconAnchor: [16, 45],
  popupAnchor: [0, -40],
  shadowSize: [50, 50],
  shadowAnchor: [16, 48],
  className: "drop-shadow-xl",
});

// ─── Component ──────────────────────────────────────────────────────────
interface CustomerMapProps {
  customers: Customer[];
  className?: string;
}

const FitBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) {
      map.setView([17.6599, 75.9064], 11); // Solapur center
      return;
    }
    if (positions.length === 1) {
      map.setView(positions[0], 14);
      return;
    }
    map.fitBounds(positions, { padding: [80, 80] });
  }, [map, positions]);

  return null;
};

const CustomerMap = ({ customers = [], className = "" }: CustomerMapProps) => {
  // Fix Leaflet default icons (run once)
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const validCustomers = useMemo(
    () =>
      customers.filter(
        (c) =>
          c?.latitude != null &&
          c?.longitude != null &&
          !isNaN(c.latitude) &&
          !isNaN(c.longitude)
      ),
    [customers]
  );

  const positions = validCustomers.map((c) => [c.latitude!, c.longitude!] as [number, number]);

  // Debug info
  console.log(`CustomerMap → Valid customers with coordinates: ${validCustomers.length}`);

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-2xl border border-amber-200/40 
                  bg-gradient-to-br from-amber-50/10 to-transparent relative ${className}`}
    >
      <MapContainer
        center={[17.6599, 75.9064]} // Solapur, Maharashtra
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        className="min-h-[600px] rounded-2xl"
      >
        {/* Clean & modern tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | CartoDB'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
        />

        <FitBounds positions={positions} />

        {/* Clustering with custom gold/amber style */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={90}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount();
            const size = count > 99 ? 44 : count > 9 ? 38 : 34;

            return L.divIcon({
              html: `
                <div class="relative flex items-center justify-center w-${size} h-${size} 
                            bg-gradient-to-br from-amber-600 to-amber-700 
                            text-white font-bold text-lg rounded-full 
                            shadow-xl border-2 border-amber-300/70
                            transition-all duration-300 hover:scale-110">
                  ${count}
                  <div class="absolute inset-0 rounded-full bg-amber-400/20 animate-ping"></div>
                </div>
              `,
              className: "custom-cluster",
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
            });
          }}
        >
          {validCustomers.map((customer) => (
            <Marker
              key={customer.id}
              position={[customer.latitude!, customer.longitude!]}
              icon={goldIcon}
            >
              <Popup className="premium-popup !bg-white/95 !backdrop-blur-sm !border-amber-300/40 !rounded-xl !shadow-2xl">
                <div className="text-sm min-w-[260px] p-2">
                  <h4 className="font-bold text-amber-900 text-lg mb-2 border-b border-amber-200 pb-1">
                    {customer.name}
                  </h4>
                  <p className="flex items-center gap-2 mb-1.5 text-gray-800">
                    <span className="text-amber-700 text-lg">📞</span>
                    {customer.mob_no}
                  </p>
                  <p className="flex items-start gap-2 mb-3 text-gray-700">
                    <span className="text-amber-700 text-lg mt-0.5">📍</span>
                    <span>{customer.address}</span>
                  </p>
                  <p className="flex items-center gap-2 mb-1.5 text-gray-700 text-xs font-mono">
                    <span className="text-amber-700">📌</span>
                    <span>Lat: {Number(customer.latitude)?.toFixed(4) || 'N/A'}</span>
                  </p>
                  <p className="flex items-center gap-2 mb-3 text-gray-700 text-xs font-mono">
                    <span className="text-amber-700">📌</span>
                    <span>Lon: {Number(customer.longitude)?.toFixed(4) || 'N/A'}</span>
                  </p>
                  {customer.purpose_name && (
                    <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-amber-100 to-amber-50 
                                     text-amber-800 rounded-full text-sm font-medium shadow-sm">
                      {customer.purpose_name}
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Beautiful empty state overlay */}
      {validCustomers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/40 to-amber-950/30 backdrop-blur-md rounded-2xl z-[1000]">
          <div className="text-center text-white px-10 py-12 bg-gradient-to-br from-amber-900/95 to-amber-950/95 
                          rounded-2xl max-w-lg shadow-2xl border border-amber-400/30 transform transition-all hover:scale-105">
            <MapPin className="w-20 h-20 mx-auto mb-6 text-amber-300 animate-pulse" />
            <h3 className="text-2xl font-bold mb-4 gold-gradient-text">
              No Customers on Map Yet
            </h3>
            <p className="text-amber-100/90 text-lg leading-relaxed">
              Add customers with complete addresses.<br />
              Use the <strong className="text-amber-300">"Auto Locate"</strong> button<br />
              to automatically add coordinates!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMap;
