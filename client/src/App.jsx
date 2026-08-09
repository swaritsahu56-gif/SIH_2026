import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        console.log("📍 Current GPS:", newLocation);

        setLocation(newLocation);
        setLocationLoading(false);
      },
      (error) => {
        console.error("GPS error:", error);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  if (locationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-leaf-50">
        <div className="text-center">
          <div className="text-4xl mb-3">📍</div>
          <h2 className="text-xl font-bold text-leaf-900">
            Getting your location...
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Allow location access to personalize your farm dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard location={location} />}
      />

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}