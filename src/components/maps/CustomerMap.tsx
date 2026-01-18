import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Customer } from "@/types";

// Custom gold marker icon (defined outside is fine)
const goldIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface CustomerMapProps {
  customers: Customer[];
  className?: string;
}

const CustomerMap = ({ customers = [], className = "" }: CustomerMapProps) => {
  // FIX: Fix Leaflet icons INSIDE the component → valid hook call
  useEffect(() => {
    // Remove old method to prevent conflicts
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    // Use reliable CDN URLs
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []); // Empty deps = run once

  // Safe filter: customers is guaranteed array
  const validCustomers = customers.filter(
    (c) => c?.latitude != null && c?.longitude != null
  );

  const defaultCenter: [number, number] = [21.1458, 79.0882]; // Nagpur

  return (
    <div className={`rounded-lg overflow-hidden border border-border ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: "500px", width: "100%" }} // Explicit height required
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validCustomers.map((customer) => (
          <Marker
            key={customer.id}
            position={[customer.latitude!, customer.longitude!]}
            icon={goldIcon}
          >
            <Popup>
              <div className="text-sm">
                <h4 className="font-semibold text-gray-800">{customer.name}</h4>
                <p className="text-gray-600">Mobile: {customer.mob_no}</p>
                <p className="text-gray-600">Address: {customer.address}</p>
                {customer.purpose_name && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">
                    {customer.purpose_name}
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CustomerMap;