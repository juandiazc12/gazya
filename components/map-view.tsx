"use client"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { useGasStations } from "@/contexts/gas-stations-context"

// Importar Leaflet de forma dinámica para evitar problemas de SSR
const MapWithNoSSR = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-500" />
        <p className="text-gray-500">Cargando mapa...</p>
      </div>
    </div>
  ),
})

interface MapViewProps {
  onStationSelect: (stationId: string) => void
  onNavigate?: (stationId: string) => void
}

export function MapView({ onStationSelect, onNavigate }: MapViewProps) {
  const { stations, loading, error } = useGasStations()

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-500" />
          <p className="text-gray-500">Cargando gasolineras cercanas...</p>
        </div>
      </div>
    )
  }

  if (error && stations.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <MapWithNoSSR stations={stations} onStationSelect={onStationSelect} onNavigate={onNavigate} />
    </div>
  )
}
