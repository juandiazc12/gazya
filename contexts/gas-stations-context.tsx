"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface GasStation {
  id: string
  name: string
  brand: string
  position: [number, number]
  price: string
  distance: string
  address: string
  rating: number
  services: string[]
}

interface GasStationsContextType {
  stations: GasStation[]
  loading: boolean
  error: string | null
  fetchStations: (lat: number, lon: number) => Promise<void>
  selectedStation: string | null
  setSelectedStation: (id: string | null) => void
  userLocation: [number, number]
}

const GasStationsContext = createContext<GasStationsContextType | undefined>(undefined)

export function useGasStations() {
  const context = useContext(GasStationsContext)
  if (context === undefined) {
    throw new Error("useGasStations must be used within a GasStationsProvider")
  }
  return context
}

interface GasStationsProviderProps {
  children: ReactNode
}

export function GasStationsProvider({ children }: GasStationsProviderProps) {
  const [stations, setStations] = useState<GasStation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  // Ubicación predeterminada: Bogotá, Colombia
  const [userLocation, setUserLocation] = useState<[number, number]>([4.6097, -74.0817])

  // Función para calcular distancia entre dos puntos (fórmula de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distancia en km
    return distance
  }

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
  }

  // Función para obtener gasolineras cercanas usando datos simulados para Colombia
  const fetchStations = async (lat: number, lon: number) => {
    try {
      setLoading(true)
      setError(null)
      setUserLocation([lat, lon])

      console.log("Buscando gasolineras cerca de:", lat, lon)

      // Usar directamente datos simulados para Colombia
      // En una aplicación real, aquí se conectaría con una API de gasolineras de Colombia
      loadColombianGasStations(lat, lon)
    } catch (err) {
      console.error("Error fetching gas stations:", err)
      setError("No se pudieron cargar las gasolineras. Usando datos de respaldo.")
      setLoading(false)
      loadColombianGasStations(lat, lon)
    }
  }

  // Cargar datos simulados de gasolineras colombianas con distancias reales
  const loadColombianGasStations = (lat: number, lon: number) => {
    // Marcas comunes en Colombia
    const brands = ["Terpel", "Texaco", "Mobil", "Primax", "Biomax", "Petrobras", "Zeuss", "Puma"]
    const services = [
      ["Tienda", "Baños"],
      ["Tienda", "Baños", "Aire"],
      ["Tienda", "Cafetería"],
      ["Tienda", "Baños", "Aire", "Cafetería"],
      ["Baños", "Aire", "Lavadero"],
      ["Tienda", "Baños", "Lavadero"],
    ]

    // Generar ubicaciones de gasolineras alrededor de la ubicación del usuario
    // con distancias variadas y realistas
    const gasStations: GasStation[] = []

    // Crear 15 gasolineras con distancias variadas
    for (let i = 0; i < 15; i++) {
      // Generar ubicaciones aleatorias dentro de un radio variable
      // Distancias más cortas tienen mayor probabilidad
      const distanceFactor = Math.random() * Math.random() * 5 // Favorece distancias más cortas
      const angle = Math.random() * 2 * Math.PI

      // Convertir distancia a cambios en coordenadas
      // 1 grado de latitud = aproximadamente 111.32 km
      const latOffset = (distanceFactor * Math.cos(angle)) / 111.32
      // Ajustar longitud según latitud (los grados de longitud varían con la latitud)
      const lonOffset = (distanceFactor * Math.sin(angle)) / (111.32 * Math.cos(deg2rad(lat)))

      const stationLat = lat + latOffset
      const stationLon = lon + lonOffset

      // Calcular distancia real usando la fórmula de Haversine
      const distance = calculateDistance(lat, lon, stationLat, stationLon)

      // Seleccionar marca y servicios aleatorios
      const brand = brands[Math.floor(Math.random() * brands.length)]
      const serviceSet = services[Math.floor(Math.random() * services.length)]

      // Generar precio basado en la distancia (más lejos, potencialmente más barato)
      // Precios en pesos colombianos para gasolina corriente (2023-2024)
      const basePrice = 9500
      const priceVariation = Math.random() > 0.5 ? -Math.random() * 500 * (distance / 3) : Math.random() * 300
      const price = Math.round(basePrice + priceVariation)

      gasStations.push({
        id: `station-${i}`,
        name: `${brand} ${getRandomLocationName()}`,
        brand: brand,
        position: [stationLat, stationLon],
        price: `$${price}`,
        distance: `${distance.toFixed(1)} km`,
        address: getRandomAddress(),
        rating: (3 + Math.random() * 2).toFixed(1),
        services: serviceSet,
      })
    }

    // Ordenar por distancia
    gasStations.sort(
      (a, b) => Number.parseFloat(a.distance.replace(" km", "")) - Number.parseFloat(b.distance.replace(" km", "")),
    )

    console.log("Gasolineras cargadas:", gasStations.length)
    setStations(gasStations)
    setLoading(false)
  }

  // Nombres de ubicaciones colombianas para datos simulados
  const getRandomLocationName = () => {
    const locations = [
      "Centro",
      "Norte",
      "Sur",
      "Chapinero",
      "Suba",
      "Kennedy",
      "Usaquén",
      "Fontibón",
      "Engativá",
      "Bosa",
      "Ciudad Bolívar",
      "San Cristóbal",
      "Teusaquillo",
      "Puente Aranda",
      "La Candelaria",
      "Santa Fe",
    ]
    return locations[Math.floor(Math.random() * locations.length)]
  }

  // Direcciones colombianas para datos simulados
  const getRandomAddress = () => {
    const streetTypes = ["Calle", "Carrera", "Avenida", "Diagonal", "Transversal"]
    const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)]
    const streetNumber = Math.floor(Math.random() * 150) + 1
    const addressNumber = Math.floor(Math.random() * 100) + 1
    const secondNumber = Math.floor(Math.random() * 100) + 1

    return `${streetType} ${streetNumber} # ${addressNumber}-${secondNumber}`
  }

  // Cargar datos iniciales cuando el componente se monta
  useEffect(() => {
    // Intentar obtener la ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          console.log("Ubicación obtenida:", latitude, longitude)
          fetchStations(latitude, longitude)
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("No se pudo obtener tu ubicación. Usando ubicación predeterminada.")
          // Usar ubicación predeterminada (Bogotá, Colombia)
          fetchStations(4.6097, -74.0817)
        },
      )
    } else {
      setError("Geolocalización no soportada en este navegador. Usando ubicación predeterminada.")
      // Usar ubicación predeterminada (Bogotá, Colombia)
      fetchStations(4.6097, -74.0817)
    }
  }, [])

  const value = {
    stations,
    loading,
    error,
    fetchStations,
    selectedStation,
    setSelectedStation,
    userLocation,
  }

  return <GasStationsContext.Provider value={value}>{children}</GasStationsContext.Provider>
}
