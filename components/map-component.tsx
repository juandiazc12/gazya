"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import type { GasStation } from "@/contexts/gas-stations-context"
import { useGasStations } from "@/contexts/gas-stations-context"
import { Navigation } from "lucide-react"

// Iconos personalizados para las gasolineras colombianas
const getStationIcon = (brand: string) => {
  // Determinar color basado en la marca
  let color = "#3b82f6" // Azul por defecto

  const brandLower = brand.toLowerCase()
  if (brandLower.includes("terpel"))
    color = "#E30613" // Rojo Terpel
  else if (brandLower.includes("texaco"))
    color = "#FF0000" // Rojo Texaco
  else if (brandLower.includes("mobil"))
    color = "#0066CC" // Azul Mobil
  else if (brandLower.includes("primax"))
    color = "#FF6600" // Naranja Primax
  else if (brandLower.includes("biomax"))
    color = "#009A3E" // Verde Biomax
  else if (brandLower.includes("petrobras"))
    color = "#009933" // Verde Petrobras
  else if (brandLower.includes("zeuss"))
    color = "#000000" // Negro Zeuss
  else if (brandLower.includes("puma")) color = "#CC0000" // Rojo Puma

  return new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
    className: `station-icon ${brandLower.replace(/\s+/g, "-")}`,
    color: color,
  })
}

// Componente para centrar el mapa en la ubicación del usuario
function LocateUser() {
  const map = useMap()
  const { userLocation, fetchStations } = useGasStations()

  useEffect(() => {
    // Esperar un momento para asegurarse de que el mapa está completamente inicializado
    const timer = setTimeout(() => {
      map.setView(userLocation, 14)

      // Opcionalmente, intentar obtener la ubicación actual
      map.locate({ setView: false })

      function onLocationFound(e: L.LocationEvent) {
        // Si la ubicación encontrada es diferente a la actual, actualizar
        if (Math.abs(e.latlng.lat - userLocation[0]) > 0.001 || Math.abs(e.latlng.lng - userLocation[1]) > 0.001) {
          console.log("Nueva ubicación encontrada:", e.latlng)
          fetchStations(e.latlng.lat, e.latlng.lng)
        }
      }

      map.on("locationfound", onLocationFound)
    }, 500)

    return () => {
      clearTimeout(timer)
      map.off("locationfound")
    }
  }, [map, userLocation, fetchStations])

  return null
}

interface MapComponentProps {
  stations: GasStation[]
  onStationSelect: (stationId: string) => void
  onNavigate?: (stationId: string) => void
}

export default function MapComponent({ stations, onStationSelect, onNavigate }: MapComponentProps) {
  const { userLocation } = useGasStations()
  const [mapReady, setMapReady] = useState(false)

  // Corregir el problema de los iconos de Leaflet en Next.js
  useEffect(() => {
    // Solo ejecutar en el cliente
    delete L.Icon.Default.prototype._getIconUrl

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })
  }, [])

  // Manejar el evento cuando el mapa está listo
  const handleMapReady = () => {
    setMapReady(true)
  }

  return (
    <>
      <style jsx global>{`
        .station-icon::before {
          content: "";
          position: absolute;
          top: -5px;
          left: 10px;
          width: 30px;
          height: 15px;
          border-radius: 3px;
          z-index: -1;
        }
        .station-icon.terpel::before { background-color: #E30613 !important; }
        .station-icon.texaco::before { background-color: #FF0000 !important; }
        .station-icon.mobil::before { background-color: #0066CC !important; }
        .station-icon.primax::before { background-color: #FF6600 !important; }
        .station-icon.biomax::before { background-color: #009A3E !important; }
        .station-icon.petrobras::before { background-color: #009933 !important; }
        .station-icon.zeuss::before { background-color: #000000 !important; }
        .station-icon.puma::before { background-color: #CC0000 !important; }
        .price-tag {
          background: white;
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
        }
      `}</style>

      <MapContainer
        center={userLocation}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        whenReady={handleMapReady}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapReady && <LocateUser />}

        {/* Marcador de ubicación del usuario */}
        <Circle
          center={userLocation}
          radius={300}
          pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.2 }}
        />

        {/* Marcadores de gasolineras */}
        {mapReady &&
          stations.map((station) => {
            const icon = getStationIcon(station.brand)
            const brandClass = station.brand.toLowerCase().replace(/\s+/g, "-")

            return (
              <Marker
                key={station.id}
                position={station.position}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    onStationSelect(station.id)
                  },
                }}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold">{station.name}</h3>
                    <p className="text-green-600 font-bold">{station.price}</p>
                    <p className="text-sm text-gray-500">{station.distance}</p>
                    <div className="flex space-x-2 mt-2">
                      <Button size="sm" className="w-full" onClick={() => onStationSelect(station.id)}>
                        Ver detalles
                      </Button>
                      {onNavigate && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            onNavigate(station.id)
                          }}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Navegar
                        </Button>
                      )}
                    </div>
                  </div>
                </Popup>
                <div className="price-tag">{station.price}</div>
              </Marker>
            )
          })}
      </MapContainer>
    </>
  )
}
