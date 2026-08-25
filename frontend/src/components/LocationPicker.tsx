import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix Leaflet's default icon issue with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, accuracy: number | null, source: string, address: string) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('');
  const [source, setSource] = useState('MANUAL_PIN');
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`);
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        return data.display_name;
      }
    } catch (e) {
      console.error("Geocoding failed", e);
    }
    return '';
  };

  const handleLocationFound = async (lat: number, lng: number, acc: number | null, src: string) => {
    setPosition([lat, lng]);
    setAccuracy(acc);
    setSource(src);
    const addr = await reverseGeocode(lat, lng);
    onLocationSelect(lat, lng, acc, src, addr);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleLocationFound(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, 'GPS');
        },
        (err) => {
          console.error("GPS Error", err);
          alert("Unable to get GPS location. Please drop a pin on the map.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  // Component to handle map clicks
  const MapClickComponent = () => {
    useMapEvents({
      click(e) {
        handleLocationFound(e.latlng.lat, e.latlng.lng, null, 'MANUAL_PIN');
      },
    });
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">Incident Location</label>
        <button
          type="button"
          onClick={getUserLocation}
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <MapPin className="h-4 w-4" />
          Use Current GPS Location
        </button>
      </div>

      <div className="h-64 w-full rounded-lg overflow-hidden border border-slate-300 relative z-0">
        <MapContainer
          center={[40.7128, -74.0060]} // Default to NYC
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && <Marker position={position} />}
          <MapClickComponent />
        </MapContainer>
      </div>

      {address && (
        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <strong>Selected Address:</strong> {address}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
