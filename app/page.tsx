"use client"

import { useState } from "react"
import { Filter, Bell, Search, Menu, Star, User, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GasStationCard } from "@/components/gas-station-card"
import { GasStationDetail } from "@/components/gas-station-detail"
import { NavigationRoute } from "@/components/navigation-route"
import { FilterPanel } from "@/components/filter-panel"
import { NotificationPanel } from "@/components/notification-panel"
import { FavoritesPanel } from "@/components/favorites-panel"
import { ReviewPanel } from "@/components/review-panel"
import { MapView } from "@/components/map-view"
import { useGasStations } from "@/contexts/gas-stations-context"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function Page() {
  const [showNavigation, setShowNavigation] = useState(false)
  const [activeTab, setActiveTab] = useState("mapa")
  const { stations, loading, selectedStation, setSelectedStation } = useGasStations()
  const [searchQuery, setSearchQuery] = useState("")

  const handleStationSelect = (stationId: string) => {
    setSelectedStation(stationId)
    setShowNavigation(false)
  }

  const handleNavigate = (stationId?: string) => {
    if (stationId) {
      setSelectedStation(stationId)
    }
    setShowNavigation(true)
  }

  // Filtrar estaciones por búsqueda
  const filteredStations = stations.filter(
    (station) =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Encontrar la estación seleccionada
  const selectedStationData = stations.find((station) => station.id === selectedStation)

  return (
    <main className="flex flex-col h-screen bg-gray-50">
      {/* Barra superior */}
      <header className="bg-white p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-bold text-xl">
            <span className="text-red-600">Gas</span>
            <span className="text-yellow-500">Ya</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <NotificationPanel />
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Filter className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <FilterPanel />
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="py-6">
                <h2 className="text-lg font-bold mb-6">Menú</h2>
                <div className="space-y-4">
                  <Button variant="ghost" className="w-full justify-start">
                    <Home className="mr-2 h-5 w-5" />
                    Inicio
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Star className="mr-2 h-5 w-5" />
                    Favoritos
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="mr-2 h-5 w-5" />
                    Mi Perfil
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Barra de búsqueda */}
      <div className="px-4 py-2 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar gasolineras, marcas o direcciones..."
            className="pl-10 pr-4 py-2 w-full rounded-full border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 relative overflow-hidden">
        <Tabs defaultValue="mapa" className="h-full flex flex-col" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mx-4 mt-2 bg-gray-100 p-1 rounded-full">
            <TabsTrigger value="mapa" className="rounded-full data-[state=active]:bg-white">
              Mapa
            </TabsTrigger>
            <TabsTrigger value="lista" className="rounded-full data-[state=active]:bg-white">
              Lista
            </TabsTrigger>
            <TabsTrigger value="favoritos" className="rounded-full data-[state=active]:bg-white">
              Favoritos
            </TabsTrigger>
            <TabsTrigger value="reseñas" className="rounded-full data-[state=active]:bg-white">
              Reseñas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mapa" className="flex-1 relative">
            {/* Mapa interactivo con Leaflet */}
            <div className="relative h-full w-full">
              <MapView onStationSelect={handleStationSelect} onNavigate={handleNavigate} />
            </div>
          </TabsContent>

          <TabsContent value="lista" className="flex-1 p-4 overflow-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-500">Cargando gasolineras cercanas...</p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {filteredStations.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No se encontraron gasolineras que coincidan con tu búsqueda.</p>
                      <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                        Mostrar todas
                      </Button>
                    </div>
                  ) : (
                    filteredStations.map((station) => (
                      <GasStationCard
                        key={station.id}
                        id={station.id}
                        name={station.name}
                        distance={station.distance}
                        price={station.price}
                        rating={Number.parseFloat(station.rating.toString())}
                        services={station.services}
                        onSelect={handleStationSelect}
                        brand={station.brand}
                        onNavigate={handleNavigate}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="favoritos" className="flex-1 p-4">
            <FavoritesPanel onNavigate={handleNavigate} />
          </TabsContent>

          <TabsContent value="reseñas" className="flex-1 p-4">
            <ReviewPanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* Panel inferior para detalles de gasolinera seleccionada */}
      {selectedStation && !showNavigation && selectedStationData && (
        <Drawer>
          <DrawerContent>
            <DrawerHeader className="border-b pb-2 mb-0">
              <DrawerTitle>Detalles de la estación</DrawerTitle>
            </DrawerHeader>
            <GasStationDetail id={selectedStation} onNavigate={() => handleNavigate()} />
          </DrawerContent>
        </Drawer>
      )}

      {/* Panel de navegación */}
      {showNavigation && selectedStation && (
        <div className="bg-white p-4 shadow-lg rounded-t-xl">
          <NavigationRoute stationId={selectedStation} onClose={() => setShowNavigation(false)} />
        </div>
      )}
    </main>
  )
}
