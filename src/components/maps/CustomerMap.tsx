import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Customer } from "@/types";

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom gold marker icon
const goldIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface CustomerMapProps {
  customers: Customer[];
  className?: string;
}

// Component to fit bounds when customers change
function FitBounds({ customers }: { customers: Customer[] }) {
  const map = useMap();

  useEffect(() => {
    const validCustomers = customers.filter(
      (c) => c.latitude !== null && c.longitude !== null
    );

    if (validCustomers.length > 0) {
      const bounds = L.latLngBounds(
        validCustomers.map((c) => [c.latitude!, c.longitude!])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [customers, map]);

  return null;
}

const CustomerMap = ({ customers, className = "" }: CustomerMapProps) => {
  const validCustomers = customers.filter(
    (c) => c.latitude !== null && c.longitude !== null
  );

  // Default center: Nagpur, India (from the API docs coordinates)
  const defaultCenter: [number, number] = [21.1458, 79.0882];

  return (
    <div className={`rounded-lg overflow-hidden border border-border ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={10}
        style={{ height: "400px", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
                <p className="text-gray-600">{customer.mob_no}</p>
                <p className="text-gray-600">{customer.address}</p>
                {customer.purpose_name && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">
                    {customer.purpose_name}
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds customers={validCustomers} />
      </MapContainer>
    </div>
  );
};

export default CustomerMap;
