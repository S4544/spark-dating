import { useEffect } from "react";

export function useRealLocation() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await fetch("/api/location", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          });
          console.log("📍 Location updated:", pos.coords.latitude, pos.coords.longitude);
        } catch {}
      },
      (err) => console.log("Location permission denied:", err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);
}
