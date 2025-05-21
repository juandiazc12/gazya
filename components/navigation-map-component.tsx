"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from "react-leaflet"
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
function MapController({
  userLocation,
  stationLocation,
  navigationStarted,
  currentLocation,
  view,
}: {
  userLocation: [number, number]
  stationLocation: [number, number]
  navigationStarted: boolean
  currentLocation: [number, number] | null
  view: "2d" | "3d"
}) {
  const map = useMap()
  const routeRef = useRef<any>(null)
  const routePointsRef = useRef<[number, number][]>([])
  const arrowMarkersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    // Esperar un momento para asegurarse de que el mapa está completamente inicializado
    const timer = setTimeout(() => {
      const bounds = L.latLngBounds([userLocation, stationLocation])
      map.fitBounds(bounds, { padding: [50, 50] })

      // Solicitar ruta real usando OSRM
      fetchRoute(userLocation, stationLocation)
    }, 500)

    return () => {
      clearTimeout(timer)
    }
  }, [map, userLocation, stationLocation])

  // Efecto para seguir la ubicación actual durante la navegación
  useEffect(() => {
    if (navigationStarted && currentLocation) {
      map.setView(currentLocation, 17, { animate: true })

      // Ajustar la perspectiva para vista 3D si está habilitada
      if (view === "3d") {
        // Simular vista 3D ajustando la inclinación del mapa
        // (Leaflet no soporta verdadero 3D, esto es solo una simulación visual)
        map.getContainer().style.perspective = "1000px"
        map
          .getContainer()
          .querySelector(".leaflet-map-pane")!
          .setAttribute("style", "transform: rotateX(45deg) scale(1.5); transform-origin: bottom center;")
      } else {
        // Restablecer a vista 2D normal
        map.getContainer().style.perspective = ""
        map.getContainer().querySelector(".leaflet-map-pane")!.setAttribute("style", "")
      }

      // Actualizar la ruta si es necesario
      if (routePointsRef.current.length > 0) {
        // Verificar si necesitamos recalcular la ruta (si nos desviamos demasiado)
        const closestPointIndex = findClosestPointOnRoute(currentLocation, routePointsRef.current)
        const closestPoint = routePointsRef.current[closestPointIndex]
        const distanceToRoute = calculateDistance(currentLocation, closestPoint)

        // Si estamos a más de 50 metros de la ruta, recalcular
        if (distanceToRoute > 50) {
          fetchRoute(currentLocation, stationLocation)
        }
      }
    }
  }, [map, navigationStarted, currentLocation, view, stationLocation])

  // Función para encontrar el punto más cercano en la ruta
  const findClosestPointOnRoute = (currentPos: [number, number], routePoints: [number, number][]) => {
    let minDistance = Number.POSITIVE_INFINITY
    let closestIndex = 0

    routePoints.forEach((point, index) => {
      const distance = calculateDistance(currentPos, point)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })

    return closestIndex
  }

  // Función para calcular distancia entre dos puntos
  const calculateDistance = (point1: [number, number], point2: [number, number]) => {
    const R = 6371e3 // Radio de la tierra en metros
    const φ1 = (point1[0] * Math.PI) / 180
    const φ2 = (point2[0] * Math.PI) / 180
    const Δφ = ((point2[0] - point1[0]) * Math.PI) / 180
    const Δλ = ((point2[1] - point1[1]) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // en metros
  }

  // Función para obtener ruta real usando OSRM
  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      // En una implementación real, esto usaría un servicio como OSRM o Mapbox Directions API
      // Para esta demostración, generamos una ruta simulada más realista que sigue calles

      // Generar puntos intermedios simulando calles (en zigzag)
      const routePoints = generateRealisticRoute(start, end)
      routePointsRef.current = routePoints

      // Limpiar marcadores de dirección anteriores
      arrowMarkersRef.current.forEach((marker) => marker.remove())
      arrowMarkersRef.current = []

      // Eliminar ruta anterior si existe
      if (routeRef.current) {
        routeRef.current.remove()
      }

      // Crear nueva ruta
      routeRef.current = L.polyline(routePoints, {
        color: "#3b82f6",
        weight: 5,
        opacity: 0.7,
        lineJoin: "round",
        dashArray: navigationStarted ? null : "5, 10",
      }).addTo(map)

      // Añadir flechas de dirección a lo largo de la ruta
      if (routePoints.length > 2) {
        // Añadir flechas cada ciertos puntos para indicar la dirección
        for (let i = 1; i < routePoints.length - 1; i += 2) {
          const prevPoint = routePoints[i - 1]
          const currentPoint = routePoints[i]

          // Calcular ángulo para la flecha
          const angle = calculateAngle(prevPoint, currentPoint)

          // Crear icono de flecha
          const arrowIcon = L.divIcon({
            html: `<div style="transform: rotate(${angle}deg);">→</div>`,
            className: "route-arrow-icon",
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })

          // Añadir marcador con flecha
          const arrowMarker = L.marker(currentPoint, { icon: arrowIcon }).addTo(map)
          arrowMarkersRef.current.push(arrowMarker)
        }
      }
    } catch (error) {
      console.error("Error fetching route:", error)
    }
  }

  // Calcular ángulo entre dos puntos para la flecha
  const calculateAngle = (point1: [number, number], point2: [number, number]) => {
    const latDiff = point2[0] - point1[0]
    const lngDiff = point2[1] - point1[1]
    return (Math.atan2(lngDiff, latDiff) * 180) / Math.PI + 90
  }

  // Generar ruta realista simulada
  const generateRealisticRoute = (start: [number, number], end: [number, number]) => {
    const points: [number, number][] = []
    const midLat = (start[0] + end[0]) / 2
    const midLon = (start[1] + end[1]) / 2

    // Añadir punto inicial
    points.push(start)

    // Generar puntos intermedios simulando calles en cuadrícula
    // Primero moverse horizontalmente
    points.push([start[0], midLon + (Math.random() * 0.002 - 0.001)])

    // Luego algunos puntos intermedios simulando intersecciones
    const numIntersections = 3 + Math.floor(Math.random() * 3)
    for (let i = 1; i <= numIntersections; i++) {
      const ratio = i / (numIntersections + 1)
      const lat = start[0] + (end[0] - start[0]) * ratio + (Math.random() * 0.002 - 0.001)
      const lon = start[1] + (end[1] - start[1]) * ratio + (Math.random() * 0.002 - 0.001)
      points.push([lat, lon])
    }

    // Finalmente moverse verticalmente hacia el destino
    points.push([end[0], end[1] - (Math.random() * 0.002 - 0.001)])

    // Añadir punto final
    points.push(end)

    return points
  }

  // Actualizar la ruta cuando cambia la vista
  useEffect(() => {
    if (routeRef.current) {
      fetchRoute(userLocation, stationLocation)
    }
  }, [view])

  return null
}

// Componente para actualizar la posición del usuario
function LocationUpdater({ onLocationUpdate }: { onLocationUpdate: (pos: [number, number]) => void }) {
  const map = useMapEvents({
    locationfound(e) {
      onLocationUpdate([e.latlng.lat, e.latlng.lng])
    },
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      map.locate()
    }, 1000)

    return () => clearTimeout(timer)
  }, [map])

  return null
}

interface NavigationMapComponentProps {
  stationId: string
  progress: number
  view: "2d" | "3d"
  navigationStarted: boolean
  currentLocation: [number, number] | null
}

export default function NavigationMapComponent({
  stationId,
  progress,
  view,
  navigationStarted,
  currentLocation: propCurrentLocation,
}: NavigationMapComponentProps) {
  const { stations, userLocation } = useGasStations()
  const [mapReady, setMapReady] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(propCurrentLocation)
  const [heading, setHeading] = useState<number | null>(null)

  // Encontrar la estación seleccionada
  const station = stations.find((s) => s.id === stationId)
  const stationLocation = station ? station.position : userLocation

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
  const getCurrentPosition = () => {
    if (propCurrentLocation) return propCurrentLocation
    if (currentLocation) return currentLocation

    const idx = Math.floor((progress / 100) * (routePoints.length - 1))
    return routePoints[idx] as [number, number]
  }

  // Efecto para obtener la orientación del dispositivo
  useEffect(() => {
    if (!navigationStarted) return

    // Verificar si el dispositivo soporta la API de orientación
    if ("DeviceOrientationEvent" in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          setHeading(event.alpha)
        }
      }

      window.addEventListener("deviceorientation", handleOrientation)

      return () => {
        window.removeEventListener("deviceorientation", handleOrientation)
      }
    }
  }, [navigationStarted])

  useEffect(() => {
    // Corregir el problema de los iconos de Leaflet en Next.js
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

  // Manejar actualización de ubicación
  const handleLocationUpdate = (pos: [number, number]) => {
    setCurrentLocation(pos)
  }

  // Crear un icono personalizado para el usuario con dirección
  const getUserIcon = () => {
    if (heading !== null) {
      // Crear un icono que muestre la dirección
      return new L.DivIcon({
        html: `
          <div class="user-location-marker">
            <div class="user-location-pulse"></div>
            <div class="user-location-arrow" style="transform: rotate(${heading}deg)">▲</div>
          </div>
        `,
        className: "user-location-container",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })
    }

    return userIcon
  }

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
        
        /* Animación de pulso para el marcador de usuario */
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .user-location-pulse {
          width: 20px;
          height: 20px;
          background-color: rgba(59, 130, 246, 0.5);
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s infinite;
          z-index: -1;
        }
        
        .user-location-container {
          background: transparent;
          border: none;
        }
        
        .user-location-marker {
          position: relative;
          width: 30px;
          height: 30px;
        }
        
        .user-location-arrow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #3b82f6;
          font-size: 20px;
          font-weight: bold;
          text-shadow: 0 0 3px white;
        }
        
        .route-arrow-icon {
          background: transparent;
          border: none;
          color: #3b82f6;
          font-size: 16px;
          font-weight: bold;
          text-shadow: 0 0 3px white;
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

        {mapReady && (
          <MapController
            userLocation={userLocation}
            stationLocation={stationLocation}
            navigationStarted={navigationStarted}
            currentLocation={getCurrentPosition()}
            view={view}
          />
        )}

        {mapReady && <LocationUpdater onLocationUpdate={handleLocationUpdate} />}

        {/* Marcador de posición actual con efecto de pulso */}
        <Marker position={getCurrentPosition()} icon={getUserIcon()}>
          {navigationStarted && (
            <Popup>
              <div className="text-center">
                <div className="font-medium">Tu ubicación actual</div>
                <div className="text-sm text-gray-500">Siguiendo ruta...</div>
              </div>
            </Popup>
          )}
        </Marker>

        {/* Destino */}
        <Marker position={stationLocation} icon={stationIcon}>
          <Popup>
            <div className="text-center">
              <div className="font-medium">{station?.name || "Destino"}</div>
              <div className="text-sm text-gray-500">{station?.distance || ""}</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
