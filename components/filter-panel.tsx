"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export function FilterPanel() {
  const [distance, setDistance] = useState([5])
  const [fuelType, setFuelType] = useState("corriente")
  const [showOpenOnly, setShowOpenOnly] = useState(true)
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const services = ["Tienda", "Baños", "Aire", "Cafetería", "Restaurante", "Lavadero", "Taller"]

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service))
    } else {
      setSelectedServices([...selectedServices, service])
    }
  }

  return (
    <div>
      <SheetHeader className="mb-4">
        <SheetTitle>Filtros</SheetTitle>
        <SheetDescription>Personaliza tu búsqueda de gasolineras</SheetDescription>
      </SheetHeader>

      <div className="space-y-6">
        <div>
          <Label className="text-base">Distancia máxima: {distance[0]} km</Label>
          <Slider defaultValue={[5]} max={20} step={1} value={distance} onValueChange={setDistance} className="mt-2" />
        </div>

        <Separator />

        <div>
          <Label className="text-base mb-2 block">Tipo de combustible</Label>
          <RadioGroup value={fuelType} onValueChange={setFuelType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="corriente" id="corriente" />
              <Label htmlFor="corriente">Corriente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="extra" id="extra" />
              <Label htmlFor="extra">Extra</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="acpm" id="acpm" />
              <Label htmlFor="acpm">ACPM (Diesel)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gas" id="gas" />
              <Label htmlFor="gas">Gas Natural</Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base">Solo estaciones abiertas</Label>
            <Switch checked={showOpenOnly} onCheckedChange={setShowOpenOnly} />
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-base mb-2 block">Servicios disponibles</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {services.map((service) => (
              <Badge
                key={service}
                variant={selectedServices.includes(service) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleService(service)}
              >
                {service}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex space-x-2 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setDistance([5])
              setFuelType("corriente")
              setShowOpenOnly(true)
              setSelectedServices([])
            }}
          >
            Restablecer
          </Button>
          <Button className="flex-1">Aplicar filtros</Button>
        </div>
      </div>
    </div>
  )
}
