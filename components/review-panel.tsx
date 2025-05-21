"use client"

import { useState } from "react"
import { Star, Search, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export function ReviewPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)

  const reviews = [
    {
      id: "review1",
      stationName: "Pemex Satélite",
      user: "Carlos M.",
      rating: 5,
      comment: "Excelente servicio y precios. Los empleados son muy amables y la estación siempre está limpia.",
      time: "hace 2 días",
    },
    {
      id: "review2",
      stationName: "Mobil Las Torres",
      user: "Roberto S.",
      rating: 4,
      comment: "Buenos precios y ubicación. La tienda de conveniencia tiene buena variedad de productos.",
      time: "hace 3 días",
    },
    {
      id: "review3",
      stationName: "BP Reforma",
      user: "Miguel A.",
      rating: 5,
      comment: "La mejor gasolinera de la zona. Nunca he tenido problemas con la calidad del combustible.",
      time: "hace 1 día",
    },
    {
      id: "review4",
      stationName: "Shell Universidad",
      user: "Javier R.",
      rating: 3,
      comment: "Servicio regular, precios altos. A veces hay que esperar mucho tiempo para ser atendido.",
      time: "hace 2 semanas",
    },
  ]

  const myReviews = [
    {
      id: "myreview1",
      stationName: "BP Reforma",
      rating: 5,
      comment: "Mi gasolinera favorita. Siempre tienen buenos precios y el servicio es excelente.",
      time: "hace 1 semana",
    },
    {
      id: "myreview2",
      stationName: "Pemex Satélite",
      rating: 4,
      comment: "Buena ubicación y precios competitivos. La recomiendo.",
      time: "hace 1 mes",
    },
  ]

  const filteredReviews = reviews.filter(
    (review) =>
      review.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <Tabs defaultValue="todas">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="todas">Todas las reseñas</TabsTrigger>
          <TabsTrigger value="mis">Mis reseñas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas">
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar reseñas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{review.stationName}</div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm text-gray-500">
                      {review.user} • {review.time}
                    </div>
                  </div>
                  <p className="text-sm mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="mis">
          <div className="space-y-4 mb-6">
            {myReviews.map((review) => (
              <div key={review.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{review.stationName}</div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <div className="text-sm text-gray-500">{review.time}</div>
                </div>
                <p className="text-sm mt-2">{review.comment}</p>
                <div className="flex justify-end mt-2">
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500">
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Escribir una nueva reseña</h3>
            <div className="flex items-center mb-2">
              <div className="mr-2">Calificación:</div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 cursor-pointer ${
                      star <= (hoveredRating || rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                    }`}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Escribe tu reseña aquí..."
              className="mb-2"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <Button className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Publicar reseña
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
