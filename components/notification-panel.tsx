import { AlertTriangle, TrendingDown, Info } from "lucide-react"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export function NotificationPanel() {
  return (
    <div>
      <SheetHeader className="mb-4">
        <SheetTitle>Notificaciones</SheetTitle>
      </SheetHeader>

      <div className="flex items-center justify-between mb-4">
        <Label htmlFor="notifications">Recibir notificaciones</Label>
        <Switch id="notifications" defaultChecked />
      </div>

      <div className="flex items-center justify-between mb-4">
        <Label htmlFor="price-alerts">Alertas de precios bajos</Label>
        <Switch id="price-alerts" defaultChecked />
      </div>

      <Separator className="my-4" />

      <h3 className="font-medium mb-2">Recientes</h3>
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Estación temporalmente cerrada</h4>
                <p className="text-sm text-gray-600">Pemex Satélite estará cerrada por mantenimiento hasta las 3 PM.</p>
                <p className="text-xs text-gray-500 mt-1">Hace 30 minutos</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex">
              <TrendingDown className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">¡Precio bajo detectado!</h4>
                <p className="text-sm text-gray-600">BP Reforma ha bajado sus precios a $21.75 por litro.</p>
                <p className="text-xs text-gray-500 mt-1">Hace 2 horas</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Nueva estación agregada</h4>
                <p className="text-sm text-gray-600">Shell Universidad ahora está disponible en GasYa.</p>
                <p className="text-xs text-gray-500 mt-1">Hace 1 día</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex">
              <TrendingDown className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">¡Precio bajo detectado!</h4>
                <p className="text-sm text-gray-600">Repsol Centro ha bajado sus precios a $21.80 por litro.</p>
                <p className="text-xs text-gray-500 mt-1">Hace 2 días</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Actualización de la aplicación</h4>
                <p className="text-sm text-gray-600">GasYa v2.1 está disponible con nuevas funciones.</p>
                <p className="text-xs text-gray-500 mt-1">Hace 3 días</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
