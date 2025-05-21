"use client"

import { useState } from "react"
import { MapPin, Clock, Heart, Star, Navigation, Share2, Phone, CreditCard, Fuel, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useGasStations } from "@/contexts/gas-stations-context"
import { Progress } from "@/components/ui/progress"

interface GasStationDetailProps {
  id: string
  onNavigate: () => void
}

export function GasStationDetail({ id, onNavigate }: GasStationDetailProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { stations } = useGasStations()

  // Encontrar la estación seleccionada en el contexto
  const station = stations.find((s) => s.id === id)

  // Si no se encuentra la estación, mostrar mensaje de error
  if (!station) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">No se encontró información para esta gasolinera.</p>
      </div>
    )
  }

  // Generar URL de imagen para la estación basada en su marca
  const getStationImage = (brand: string) => {
    const brandLower = brand.toLowerCase()
    if (brandLower.includes("terpel")) {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Terpel_logo.svg/1200px-Terpel_logo.svg.png"
    } else if (brandLower.includes("texaco")) {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Texaco_logo.svg/1200px-Texaco_logo.svg.png"
    } else if (brandLower.includes("mobil")) {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Mobil_logo.svg/1200px-Mobil_logo.svg.png"
    } else if (brandLower.includes("primax")) {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Primax_logo.svg/1200px-Primax_logo.svg.png"
    } else {
      return `https://via.placeholder.com/300x150?text=${encodeURIComponent(brand)}`
    }
  }

  // Reseñas simuladas basadas en la estación
  const reviews = [
    {
      user: "Carlos R.",
      avatar: "C",
      rating: Math.min(5, Math.round(Number.parseFloat(station.rating.toString()) + 0.5)),
      comment:
        "Excelente servicio y precios competitivos. El personal es muy amable y la estación siempre está limpia.",
      time: "hace 2 días",
    },
    {
      user: "María L.",
      avatar: "M",
      rating: Math.max(3, Math.round(Number.parseFloat(station.rating.toString()) - 0.5)),
      comment: "Ubicación conveniente, pero a veces hay que esperar. Los baños están bien mantenidos.",
      time: "hace 1 semana",
    },
    {
      user: "Juan P.",
      avatar: "J",
      rating: Math.min(5, Math.round(Number.parseFloat(station.rating.toString()))),
      comment: "Buenos precios y el surtidor es rápido. La tienda tiene buena variedad de productos.",
      time: "hace 3 días",
    },
  ]

  // Tipos de combustible en Colombia con precios realistas
  const fuelTypes = [
    {
      name: "Corriente",
      price: station.price,
      progress: 85,
      status: "Disponible",
    },
    {
      name: "Extra",
      price: `$${(Number.parseFloat(station.price.replace("$", "")) + 1500).toFixed(0)}`,
      progress: 70,
      status: "Disponible",
    },
    {
      name: "ACPM (Diesel)",
      price: `$${(Number.parseFloat(station.price.replace("$", "")) - 500).toFixed(0)}`,
      progress: 90,
      status: "Disponible",
    },
    {
      name: "Gas Natural",
      price: `$${Math.round(Number.parseFloat(station.price.replace("$", "")) * 0.6)}`,
      progress: Math.random() > 0.3 ? 60 : 0,
      status: Math.random() > 0.3 ? "Disponible" : "No disponible",
    },
  ]

  // Métodos de pago aceptados
  const paymentMethods = ["Efectivo", "Tarjeta de crédito", "Tarjeta débito", "Nequi", "Daviplata", "Puntos Colombia"]

  // Horarios de atención
  const schedule = {
    "Lunes a Viernes": "24 horas",
    Sábados: "24 horas",
    "Domingos y Festivos": "24 horas",
  }

  return (
    <div className="p-4">
      {/* Imagen de la estación */}
      <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
        <img
          src={getStationImage(station.brand) || "/placeholder.svg"}
          alt={station.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h2 className="text-xl font-bold">{station.name}</h2>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span>{station.rating}</span>
            <span className="mx-2">•</span>
            <span>{station.brand}</span>
          </div>
        </div>
        <Button
          variant={isFavorite ? "default" : "outline"}
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
        </Button>
      </div>

      <div className="flex items-center text-sm text-gray-500 mb-2">
        <MapPin className="h-4 w-4 mr-1 text-gray-700" />
        {station.address}
      </div>

      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Clock className="h-4 w-4 mr-1 text-gray-700" />
        24 horas
      </div>

      {/* Botón de navegación prominente */}
      <Button
        className="w-full mb-4 py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
        onClick={onNavigate}
      >
        <Navigation className="h-5 w-5 mr-2" />
        Iniciar navegación
      </Button>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg text-center shadow-sm border border-green-200">
          <div className="text-sm text-gray-600">Precio Corriente</div>
          <div className="text-xl font-bold text-green-600">{station.price}</div>
          <div className="text-xs text-gray-500">Por galón</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg text-center shadow-sm border border-blue-200">
          <div className="text-sm text-gray-600">Distancia</div>
          <div className="text-xl font-bold text-blue-600">{station.distance}</div>
          <div className="text-xs text-gray-500">~{Math.ceil(Number.parseFloat(station.distance) * 3)} min</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {station.services.map((service, index) => (
          <Badge key={index} variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-800">
            {service}
          </Badge>
        ))}
      </div>

      <div className="flex space-x-2 mb-6">
        <Button
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          onClick={onNavigate}
        >
          <Navigation className="h-4 w-4 mr-2" />
          Navegar
        </Button>
        <Button variant="outline" className="flex-1">
          <Phone className="h-4 w-4 mr-2" />
          Llamar
        </Button>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="precios" className="mt-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="precios">Precios</TabsTrigger>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="reseñas">Reseñas</TabsTrigger>
        </TabsList>

        <TabsContent value="precios">
          <div className="space-y-4">
            {fuelTypes.map((fuel, index) => (
              <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{fuel.name}</span>
                  <span className="font-bold text-green-600">{fuel.price}</span>
                </div>
                <Progress value={fuel.progress} className="h-2 mb-1" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Disponibilidad</span>
                  <span className={fuel.status === "Disponible" ? "text-green-600" : "text-red-500"}>
                    {fuel.status}
                  </span>
                </div>
              </div>
            ))}
            <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
              <span>Precios actualizados: Hoy a las 10:30 AM</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                Reportar precios
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="info">
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-medium mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-700" />
                Horarios de atención
              </h3>
              <div className="space-y-1">
                {Object.entries(schedule).map(([day, hours], index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{day}</span>
                    <span>{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-medium mb-2 flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-gray-700" />
                Métodos de pago
              </h3>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-50">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-medium mb-2 flex items-center">
                <Fuel className="h-4 w-4 mr-2 text-gray-700" />
                Servicios disponibles
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {station.services.map((service, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    {service}
                  </div>
                ))}
                <div className="flex items-center text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Calibración de llantas
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Punto de recarga eléctrica
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-medium mb-2 flex items-center">
                <Car className="h-4 w-4 mr-2 text-gray-700" />
                Servicios adicionales
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Parqueadero
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Cajero automático
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  WiFi gratis
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Cambio de aceite
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reseñas">
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>{review.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{review.user}</div>
                        <div className="text-xs text-gray-500">{review.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm mt-2 text-gray-700">{review.comment}</p>
                </div>
              ))}

              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" className="text-xs">
                  Ver todas las reseñas
                </Button>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
