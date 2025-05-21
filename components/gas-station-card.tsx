"use client"

import { Heart, MapPin, Star, Navigation } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useState } from "react"

interface GasStationCardProps {
  id: string
  name: string
  distance: string
  price: string
  rating: number
  services: string[]
  onSelect: (id: string) => void
  brand: string
  onNavigate?: (id: string) => void
}

export function GasStationCard({
  id,
  name,
  distance,
  price,
  rating,
  services,
  onSelect,
  brand,
  onNavigate,
}: GasStationCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

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

  // Determinar color de fondo basado en la marca
  const getBrandColor = (brand: string) => {
    const brandLower = brand.toLowerCase()
    if (brandLower.includes("terpel")) return "bg-red-50 border-red-100"
    if (brandLower.includes("texaco")) return "bg-red-50 border-red-100"
    if (brandLower.includes("mobil")) return "bg-blue-50 border-blue-100"
    if (brandLower.includes("primax")) return "bg-orange-50 border-orange-100"
    if (brandLower.includes("biomax")) return "bg-green-50 border-green-100"
    return "bg-gray-50 border-gray-100"
  }

  return (
    <Card className={`overflow-hidden shadow-sm ${getBrandColor(brand)}`}>
      <CardContent className="p-0">
        <div className="flex items-center p-4">
          <div className="w-16 h-16 mr-4 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
            <img
              src={getStationImage(brand) || "/placeholder.svg"}
              alt={brand}
              className="max-w-full max-h-full object-contain p-1"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{name}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsFavorite(!isFavorite)
                }}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {distance}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                  <span className="text-sm">{rating}</span>
                </div>
                <div className="font-bold text-green-600">{price}</div>
              </div>
              <Badge variant="outline" className="text-xs bg-white">
                {brand}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {services.slice(0, 3).map((service, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-white">
                  {service}
                </Badge>
              ))}
              {services.length > 3 && (
                <Badge variant="outline" className="text-xs bg-white">
                  +{services.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-2 flex space-x-2">
        <Button variant="outline" className="flex-1" onClick={() => onSelect(id)}>
          Ver detalles
        </Button>
        <Button
          variant="default"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          onClick={(e) => {
            e.stopPropagation()
            if (onNavigate) {
              onNavigate(id)
            } else {
              onSelect(id)
            }
          }}
        >
          <Navigation className="h-4 w-4 mr-2" />
          Navegar
        </Button>
      </CardFooter>
    </Card>
  )
}
