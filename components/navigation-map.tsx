"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useGasStations } from "@/contexts/gas-stations-context"

// Iconos personalizados
const userIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
  className: "user-location-icon",
})

const stationIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
  className: "station-icon",
})

// Componente para ajustar la vista del mapa
function FitBounds({
  userLocation,
  stationLocation,
}: { userLocation: [number, number]; stationLocation: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    const bounds = L.latLngBounds([userLocation, stationLocation])
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [map, userLocation, stationLocation])

  return null
}

interface NavigationMapProps {
  stationId: string
  progress: number
}

export function NavigationMap({ stationId, progress }: NavigationMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number]>([19.4326, -99.1332]) // CDMX default
  const { stations } = useGasStations()

  // Encontrar la estación seleccionada
  const station = stations.find((s) => s.id === stationId)
  const stationLocation = station ? station.position : ([19.4356, -99.1372] as [number, number])

  // Ruta simulada (línea recta entre puntos)
  // Generar puntos intermedios para la ruta
  const generateRoutePoints = () => {
    const points = []
    const steps = 10

    for (let i = 0; i <= steps; i++) {
      const lat = userLocation[0] + (stationLocation[0] - userLocation[0]) * (i / steps)
      const lng = userLocation[1] + (stationLocation[1] - userLocation[1]) * (i / steps)
      points.push([lat, lng])
    }

    return points
  }

  const routePoints = generateRoutePoints()

  // Calcular la posición actual basada en el progreso
  const currentPosition = () => {
    const idx = Math.floor((progress / 100) * (routePoints.length - 1))
    return routePoints[idx] as [number, number]
  }

  useEffect(() => {
    // Corregir el problema de los iconos de Leaflet en Next.js
    delete L.Icon.Default.prototype._getIconUrl

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })

    // Obtener la ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  return (
    <div className="h-full w-full">
      <style jsx global>{`
        .user-location-icon::before {
          content: "";
          position: absolute;
          top: -5px;
          left: 10px;
          width: 30px;
          height: 15px;
          background-color: #3b82f6;
          border-radius: 3px;
          z-index: -1;
        }
        .station-icon::before {
          content: "";
          position: absolute;
          top: -5px;
          left: 10px;
          width: 30px;
          height: 15px;
          background-color: #ef4444;
          border-radius: 3px;
          z-index: -1;
        }
      `}</style>

      <MapContainer center={userLocation} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds userLocation={userLocation} stationLocation={stationLocation} />

        {/* Ruta */}
        <Polyline positions={routePoints} color="#3b82f6" weight={4} opacity={0.7} />

        {/* Posición actual */}
        <Marker position={currentPosition()} icon={userIcon} />

        {/* Destino */}
        <Marker position={stationLocation} icon={stationIcon} />
      </MapContainer>
    </div>
  )
}
