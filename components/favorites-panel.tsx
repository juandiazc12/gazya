"use client"

import { Heart, MapPin, Star, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FavoritesPanelProps {
  onNavigate?: (stationId: string) => void
}

export function FavoritesPanel({ onNavigate }: FavoritesPanelProps) {
  const favorites = [
    {
      id: "station1",
      name: "Terpel Satélite",
      address: "Av. Satélite 1234, Bogotá",
      distance: "1.2 km",
      price: "$9500",
      rating: 4.5,
      services: ["Tienda", "Baños", "Aire"],
    },
    {
      id: "station3",
      name: "Texaco Reforma",
      address: "Paseo de la Reforma 789, Bogotá",
      distance: "3.8 km",
      price: "$9350",
      rating: 4.7,
      services: ["Tienda", "Baños", "Aire", "Cafetería"],
    },
  ]

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Mis favoritos</h2>

      {favorites.length === 0 ? (
        <div className="text-center py-10">
          <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No tienes favoritos</h3>
          <p className="text-gray-500 mb-4">Guarda tus gasolineras favoritas para acceder rápidamente a ellas</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {favorites.map((station) => (
              <Card key={station.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">{station.name}</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {station.address}
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="flex items-center mr-4">
                          <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                          <span className="text-sm">{station.rating}</span>
                        </div>
                        <div className="font-bold text-green-600">{station.price}</div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {station.services.map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 p-2 flex space-x-2">
                  <Button
                    variant="default"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => onNavigate && onNavigate(station.id)}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Navegar
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Ver detalles
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
