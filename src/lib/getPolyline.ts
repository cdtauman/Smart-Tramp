// src/lib/getPolyline.ts
import { GOOGLE_MAPS_API_KEY } from './env'

export async function getPolyline(origin: string, destination: string): Promise<string | null> {
  const apiKey = GOOGLE_MAPS_API_KEY
  const base = 'https://maps.googleapis.com/maps/api/directions/json'

  const url = `${base}?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error('Directions request failed', response.statusText)
      return null
    }

    const data = await response.json()

    if (data.routes && data.routes.length > 0) {
      return data.routes[0].overview_polyline.points
    }

    console.error('No route found', data)
  } catch (err) {
    console.error('Failed to fetch polyline', err)
  }
  return null
}