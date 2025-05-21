"use client"

import { useState, useEffect, useRef } from "react"
import {
  ChevronLeft,
  Navigation2,
  Clock,
  MapPin,
  Volume2,
  Volume2Icon as Volume2Off,
  ChevronRight,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useGasStations } from "@/contexts/gas-stations-context"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Importar el mapa de navegación de forma dinámica
const NavigationMapWithNoSSR = dynamic(() => import("@/components/navigation-map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full flex items-center justify-center bg-gray-200 rounded-lg">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-500" />
        <p className="text-gray-500">Cargando mapa de navegación...</p>
      </div>
    </div>
  ),
})

interface NavigationRouteProps {
  stationId: string
  onClose: () => void
}

export function NavigationRoute({ stationId, onClose }: NavigationRouteProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [eta, setEta] = useState("5 min")
  const [distance, setDistance] = useState("1.2 km")
  const [navigationStarted, setNavigationStarted] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null)
  const [mapView, setMapView] = useState<"2d" | "3d">("2d")
  const [isLoading, setIsLoading] = useState(false)
  const [nextStepDistance, setNextStepDistance] = useState("300 m")
  const [showStartNavigation, setShowStartNavigation] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [highAccuracy, setHighAccuracy] = useState(false) // Desactivado por defecto para evitar timeouts
  const [isRetrying, setIsRetrying] = useState(false)

  const watchIdRef = useRef<number | null>(null)
  const { stations, userLocation } = useGasStations()

  // Encontrar la estación seleccionada
  const station = stations.find((s) => s.id === stationId)

  // Instrucciones de navegación más realistas
  const navigationSteps = [
    {
      instruction: "Inicia en tu ubicación actual",
      distance: "0 m",
      icon: "start",
      street: "Tu ubicación",
    },
    {
      instruction: "Continúa recto por la calle actual",
      distance: "300 m",
      icon: "straight",
      street: "Calle Principal",
    },
    {
      instruction: "Gira a la derecha en la próxima intersección",
      distance: "500 m",
      icon: "right",
      street: "Carrera 15",
    },
    {
      instruction: "Mantente en el carril izquierdo",
      distance: "400 m",
      icon: "left-lane",
      street: "Carrera 15",
    },
    {
      instruction: "Gira a la izquierda en la avenida principal",
      distance: "600 m",
      icon: "left",
      street: "Avenida Ciudad",
    },
    {
      instruction: "Tu destino está a la derecha",
      distance: "100 m",
      icon: "destination",
      street: station?.name || "Destino",
    },
  ]

  useEffect(() => {
    if (station) {
      setDistance(station.distance)
      // Calcular ETA aproximado (3 minutos por km)
      const distanceValue = Number.parseFloat(station.distance)
      const etaValue = Math.ceil(distanceValue * 3)
      setEta(`${etaValue} min`)
    }
  }, [stationId, station])

  // Iniciar navegación en tiempo real
  const startNavigation = () => {
    setIsLoading(true)
    setLocationError(null)

    // Verificar si la geolocalización está disponible
    if (!navigator.geolocation) {
      setLocationError("Tu dispositivo no soporta geolocalización")
      setIsLoading(false)
      return
    }

    // Usar ubicación actual como fallback si no podemos obtener la ubicación real
    const fallbackToCurrentLocation = () => {
      console.log("Usando ubicación actual como fallback")
      setCurrentLocation(userLocation)
      setNavigationStarted(true)
      setShowStartNavigation(false)
      setIsLoading(false)

      // Iniciar simulación de navegación
      startSimulatedNavigation()

      if (audioEnabled && station) {
        speakInstruction(`Iniciando navegación hacia ${station.name}. ${navigationSteps[0].instruction}`)
      }
    }

    // Solicitar permiso de ubicación y obtener ubicación inicial
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation([latitude, longitude])
          setNavigationStarted(true)
          setShowStartNavigation(false)
          setIsLoading(false)

          // Iniciar seguimiento de ubicación
          startLocationTracking()

          // Anunciar inicio de navegación
          if (audioEnabled && station) {
            speakInstruction(`Iniciando navegación hacia ${station.name}. ${navigationSteps[0].instruction}`)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          let errorMsg = "No se pudo obtener tu ubicación"

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = "Permiso de ubicación denegado. Por favor, habilita el acceso a tu ubicación."
              break
            case error.POSITION_UNAVAILABLE:
              errorMsg = "La información de ubicación no está disponible."
              break
            case error.TIMEOUT:
              errorMsg = "Se agotó el tiempo para obtener tu ubicación. Usando modo de simulación."
              fallbackToCurrentLocation()
              break
          }

          setLocationError(errorMsg)
          setIsLoading(false)
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: 10000, // 10 segundos
          maximumAge: 0,
        },
      )
    } catch (e) {
      console.error("Error al iniciar geolocalización:", e)
      setLocationError("Error al iniciar la geolocalización. Usando modo de simulación.")
      fallbackToCurrentLocation()
    }
  }

  // Iniciar simulación de navegación (cuando no podemos obtener la ubicación real)
  const startSimulatedNavigation = () => {
    // Limpiar cualquier intervalo anterior
    if (watchIdRef.current) {
      clearInterval(watchIdRef.current as unknown as number)
      watchIdRef.current = null
    }

    // Crear un intervalo para simular el movimiento
    const simulationInterval = setInterval(() => {
      if (!station) return

      // Incrementar el progreso gradualmente
      const newProgress = Math.min(100, progress + 0.5)

      // Actualizar paso actual basado en el progreso
      const stepIndex = Math.min(navigationSteps.length - 1, Math.floor((newProgress / 100) * navigationSteps.length))

      // Si cambiamos de paso, anunciar la nueva instrucción
      if (stepIndex !== currentStep) {
        setCurrentStep(stepIndex)

        // Reproducir instrucción por voz si está habilitado
        if (audioEnabled) {
          speakInstruction(navigationSteps[stepIndex].instruction)
        }
      }

      // Actualizar distancia al próximo paso
      if (stepIndex < navigationSteps.length - 1) {
        const totalDistance = Number.parseFloat(station.distance.replace(" km", "")) * 1000
        const remainingDistance = totalDistance * (1 - newProgress / 100)
        setDistance(`${(remainingDistance / 1000).toFixed(1)} km`)

        const remainingEta = Math.ceil((remainingDistance / 1000) * 3) // 3 minutos por km
        setEta(`${remainingEta} min`)

        // Calcular distancia al próximo paso
        const nextStepDistanceValue = Math.round(
          Number.parseInt(navigationSteps[stepIndex].distance.replace(" m", "")) *
            (1 - (newProgress % (100 / navigationSteps.length)) / (100 / navigationSteps.length)),
        )
        setNextStepDistance(`${nextStepDistanceValue} m`)
      }

      // Si llegamos al destino
      if (newProgress >= 99 && progress < 99) {
        if (audioEnabled) {
          speakInstruction("Has llegado a tu destino")
        }
      }

      setProgress(newProgress)

      // Simular movimiento en el mapa
      if (currentLocation && station) {
        const progressValue = Math.min(1, newProgress / 100)
        const newLat = userLocation[0] + (station.position[0] - userLocation[0]) * progressValue
        const newLng = userLocation[1] + (station.position[1] - userLocation[1]) * progressValue
        setCurrentLocation([newLat, newLng])
      }
    }, 500)

    // Guardar el ID del intervalo para limpiarlo después
    watchIdRef.current = simulationInterval as unknown as number
  }

  // Iniciar seguimiento continuo de ubicación
  const startLocationTracking = () => {
    // Limpiar cualquier seguimiento anterior
    if (watchIdRef.current !== null) {
      if (typeof watchIdRef.current === "number") {
        clearInterval(watchIdRef.current)
      } else {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      watchIdRef.current = null
    }

    try {
      // Iniciar seguimiento
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setIsRetrying(false)
          const { latitude, longitude } = position.coords
          setCurrentLocation([latitude, longitude])
          setLocationError(null)

          // Actualizar progreso basado en la distancia recorrida
          if (station) {
            const totalDistance = Number.parseFloat(station.distance.replace(" km", "")) * 1000 // en metros
            const distanceToDestination = calculateDistanceToDestination([latitude, longitude], station.position)
            const distanceTraveled = totalDistance - distanceToDestination
            const newProgress = Math.min(100, (distanceTraveled / totalDistance) * 100)

            setProgress(newProgress)

            // Actualizar paso actual basado en el progreso
            const stepIndex = Math.min(
              navigationSteps.length - 1,
              Math.floor((newProgress / 100) * navigationSteps.length),
            )

            // Si cambiamos de paso, anunciar la nueva instrucción
            if (stepIndex !== currentStep) {
              setCurrentStep(stepIndex)

              // Reproducir instrucción por voz si está habilitado
              if (audioEnabled) {
                speakInstruction(navigationSteps[stepIndex].instruction)
              }
            }

            // Actualizar distancia al próximo paso
            if (stepIndex < navigationSteps.length - 1) {
              const nextStepDistanceValue = calculateNextStepDistance(newProgress, stepIndex)
              setNextStepDistance(`${nextStepDistanceValue} m`)
            }

            // Actualizar ETA y distancia restante
            const remainingDistance = distanceToDestination / 1000 // en km
            setDistance(`${remainingDistance.toFixed(1)} km`)

            const remainingEta = Math.ceil(remainingDistance * 3) // 3 minutos por km
            setEta(`${remainingEta} min`)

            // Si llegamos al destino
            if (newProgress >= 99) {
              if (audioEnabled) {
                speakInstruction("Has llegado a tu destino")
              }
            }
          }
        },
        (error) => {
          console.error("Error tracking location:", error)

          // Si hay un error de timeout, cambiar a simulación
          if (error.code === error.TIMEOUT) {
            setLocationError("Tiempo de espera agotado. Cambiando a modo de simulación.")
            startSimulatedNavigation()
          } else {
            setLocationError("Error al seguir tu ubicación. Puedes continuar en modo de simulación.")
            setIsRetrying(true)
          }
        },
        {
          enableHighAccuracy: highAccuracy,
          maximumAge: 0,
          timeout: 15000, // 15 segundos
        },
      )
    } catch (e) {
      console.error("Error al iniciar seguimiento:", e)
      setLocationError("Error al seguir tu ubicación. Cambiando a modo de simulación.")
      startSimulatedNavigation()
    }
  }

  // Reintentar seguimiento de ubicación
  const retryLocationTracking = () => {
    setIsRetrying(true)
    setLocationError("Reintentando obtener ubicación...")

    // Reiniciar el seguimiento
    startLocationTracking()
  }

  // Cambiar a modo de simulación
  const switchToSimulation = () => {
    setLocationError("Modo de simulación activado")
    startSimulatedNavigation()
  }

  // Calcular distancia al próximo paso
  const calculateNextStepDistance = (progress: number, currentStepIndex: number) => {
    if (currentStepIndex >= navigationSteps.length - 1) return 0

    const totalSteps = navigationSteps.length
    const progressPerStep = 100 / totalSteps
    const currentStepProgress = progress % progressPerStep
    const progressRatio = currentStepProgress / progressPerStep

    // Obtener distancia del paso actual
    const currentStepDistance = Number.parseInt(navigationSteps[currentStepIndex].distance.replace(" m", ""))

    // Calcular distancia restante
    return Math.round(currentStepDistance * (1 - progressRatio))
  }

  // Detener navegación
  const stopNavigation = () => {
    setNavigationStarted(false)
    setShowStartNavigation(true)
    setIsRetrying(false)
    setLocationError(null)

    if (watchIdRef.current !== null) {
      if (typeof watchIdRef.current === "number") {
        clearInterval(watchIdRef.current)
      } else {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      watchIdRef.current = null
    }

    // Reiniciar valores
    setProgress(0)
    setCurrentStep(0)
  }

  // Función para calcular distancia a destino
  const calculateDistanceToDestination = (currentPos: [number, number], destinationPos: [number, number]) => {
    const R = 6371e3 // Radio de la tierra en metros
    const φ1 = (currentPos[0] * Math.PI) / 180
    const φ2 = (destinationPos[0] * Math.PI) / 180
    const Δφ = ((destinationPos[0] - currentPos[0]) * Math.PI) / 180
    const Δλ = ((destinationPos[1] - currentPos[1]) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // en metros
  }

  // Función para reproducir instrucciones por voz
  const speakInstruction = (instruction: string) => {
    if ("speechSynthesis" in window) {
      // Cancelar cualquier instrucción anterior
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(instruction)
      utterance.lang = "es-CO"
      utterance.rate = 0.9 // Ligeramente más lento para mejor comprensión
      utterance.volume = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        if (typeof watchIdRef.current === "number") {
          clearInterval(watchIdRef.current)
        } else {
          navigator.geolocation.clearWatch(watchIdRef.current)
        }
      }

      // Cancelar cualquier instrucción de voz pendiente
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  if (!station) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">No se encontró información para esta gasolinera.</p>
        <Button className="mt-4" onClick={onClose}>
          Volver
        </Button>
      </div>
    )
  }

  // Renderizar icono de instrucción
  const renderInstructionIcon = (icon: string | undefined) => {
    // Verificar que icon no sea undefined
    if (!icon) {
      return (
        <div className="bg-blue-500 rounded-full p-1">
          <Navigation2 className="h-5 w-5 text-white" />
        </div>
      )
    }

    switch (icon) {
      case "start":
        return (
          <div className="bg-green-500 rounded-full p-1">
            <MapPin className="h-5 w-5 text-white" />
          </div>
        )
      case "straight":
        return (
          <div className="bg-blue-500 rounded-full p-1 rotate-90">
            <ChevronRight className="h-5 w-5 text-white" />
          </div>
        )
      case "right":
        return (
          <div className="bg-blue-500 rounded-full p-1">
            <ChevronRight className="h-5 w-5 text-white" />
          </div>
        )
      case "left":
        return (
          <div className="bg-blue-500 rounded-full p-1 rotate-180">
            <ChevronRight className="h-5 w-5 text-white" />
          </div>
        )
      case "left-lane":
        return (
          <div className="bg-yellow-500 rounded-full p-1">
            <Navigation2 className="h-5 w-5 text-white" />
          </div>
        )
      case "destination":
        return (
          <div className="bg-red-500 rounded-full p-1">
            <MapPin className="h-5 w-5 text-white" />
          </div>
        )
      default:
        return (
          <div className="bg-blue-500 rounded-full p-1">
            <Navigation2 className="h-5 w-5 text-white" />
          </div>
        )
    }
  }

  // Asegurarse de que currentStep esté dentro de los límites válidos
  const safeCurrentStep = Math.min(currentStep, navigationSteps.length - 1)
  const currentInstruction = navigationSteps[safeCurrentStep] || navigationSteps[0]

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="font-bold">{station.name}</div>
        <Button variant="ghost" size="icon" onClick={() => setAudioEnabled(!audioEnabled)}>
          {audioEnabled ? <Volume2 className="h-5 w-5" /> : <Volume2Off className="h-5 w-5" />}
        </Button>
      </div>

      {locationError && (
        <Alert variant={isRetrying ? "default" : "destructive"} className="mb-4">
          <div className="flex items-center">
            {isRetrying ? (
              <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            <AlertDescription>{locationError}</AlertDescription>
          </div>
          {!isRetrying && navigationStarted && (
            <div className="flex space-x-2 mt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={retryLocationTracking}>
                <RefreshCcw className="h-3 w-3 mr-1" />
                Reintentar
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={switchToSimulation}>
                Usar simulación
              </Button>
            </div>
          )}
        </Alert>
      )}

      {showStartNavigation ? (
        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm border border-gray-200 text-center">
          <div className="mb-4">
            <div className="bg-blue-100 rounded-full p-3 inline-flex mb-2">
              <Navigation2 className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Iniciar navegación</h3>
            <p className="text-gray-600 mt-1">
              Te guiaremos paso a paso hasta {station.name} a {station.distance} de distancia.
            </p>
          </div>

          <div className="flex flex-col space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Distancia:</span>
              <span className="font-medium">{station.distance}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tiempo estimado:</span>
              <span className="font-medium">{eta}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Instrucciones por voz:</span>
              <span className="font-medium">{audioEnabled ? "Activadas" : "Desactivadas"}</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2">
              <Label htmlFor="high-accuracy" className="text-gray-600">
                Alta precisión GPS:
              </Label>
              <Switch id="high-accuracy" checked={highAccuracy} onCheckedChange={setHighAccuracy} />
            </div>
            <div className="text-xs text-gray-500 text-left">
              {highAccuracy
                ? "La alta precisión puede tardar más en obtener la ubicación pero es más exacta."
                : "La precisión estándar es más rápida pero menos exacta."}
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            onClick={startNavigation}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Obteniendo ubicación...
              </>
            ) : (
              <>
                <Navigation2 className="h-4 w-4 mr-2" />
                Iniciar navegación en tiempo real
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-4 shadow-sm border border-blue-200">
          <div className="flex items-center mb-2">
            {renderInstructionIcon(currentInstruction?.icon)}
            <div className="ml-3">
              <span className="font-medium text-lg">{currentInstruction?.instruction || "Navegando..."}</span>
              <div className="text-sm text-gray-600">{currentInstruction?.street || ""}</div>
            </div>
          </div>
          <div className="flex items-center mb-2">
            <Badge variant="outline" className="bg-white">
              {safeCurrentStep < navigationSteps.length - 1 ? nextStepDistance : "Llegando"}
            </Badge>
          </div>
          <Progress value={progress} className="h-2 mb-4 bg-blue-200" indicatorClassName="bg-blue-500" />
          <div className="flex justify-between text-sm text-gray-700">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-blue-600" />
              ETA: {eta}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-blue-600" />
              {distance} restantes
            </div>
          </div>
        </div>
      )}

      <div className="relative h-[300px] bg-gray-200 rounded-lg overflow-hidden shadow-md">
        <NavigationMapWithNoSSR
          stationId={stationId}
          progress={progress}
          view={mapView}
          navigationStarted={navigationStarted}
          currentLocation={currentLocation}
        />

        <div className="absolute top-2 right-2 bg-white rounded-md shadow-md">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setMapView(mapView === "2d" ? "3d" : "2d")}
          >
            <span className="text-xs font-bold">{mapView.toUpperCase()}</span>
          </Button>
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        {!navigationStarted ? (
          <>
            <Button variant="outline" onClick={onClose} className="flex-1 mr-2">
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              onClick={startNavigation}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Navigation2 className="h-4 w-4 mr-2" />
                  Iniciar
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button variant="destructive" onClick={stopNavigation} className="flex-1 mr-2">
              Detener
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                window.open(
                  `https://waze.com/ul?ll=${station.position[0]},${station.position[1]}&navigate=yes`,
                  "_blank",
                )
              }
            >
              Abrir en Waze
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
