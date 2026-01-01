export type Destination = {
  id: string
  name: string
  description: string
}

export type Recommendation = {
  id: string
  rank: string
  title: string
  reason: string
}

export type ItineraryItem = {
  id: string
  title: string
  description: string
}

export type ItineraryDay = {
  day: number
  title: string
  items: ItineraryItem[]
}

export type Persona = {
  keyword: string
  tags: string[]
  description: string
  destinations: Destination[]
  itinerary: ItineraryDay[]
  recommendations?: Recommendation[]
}
