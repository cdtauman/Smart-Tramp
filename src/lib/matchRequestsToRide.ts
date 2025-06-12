// src/lib/matchRequestsToRide.ts
import { supabase } from '@/lib/supabaseClient'
import polyline from '@mapbox/polyline'
import { getDistance } from 'geolib'
import type { Match, Request } from '@/types'

// Minimal error interface used when Supabase typings are unavailable
interface PostgrestError { message: string }

const MAX_PICKUP_DISTANCE_METERS = 1000 // מקסימום מרחק מותר מהמסלול

export async function matchRequestsToRide(rideId: string): Promise<Match[]> {
  // שלב 1: שליפת המסלול
  const { data: ride, error: rideError } = await supabase
    .from('rides')
    .select('*')
    .eq('id', rideId)
    .single()

  if (rideError || !ride) {
    console.error('Ride not found', rideError)
    return []
  }

  const routePoints = polyline.decode(ride.polyline).map(
    ([lat, lng]: [number, number]) => ({ latitude: lat, longitude: lng })
  )

  // שלב 2: שליפת כל הבקשות הפנדינג עם מיקומים
  const { data: requests, error: reqError } = await supabase
    .from('requests')
    .select('*')
    .eq('status', 'pending') as { data: Request[] | null; error: PostgrestError | null }

  if (reqError || !requests) {
    console.error('Failed to fetch requests', reqError)
    return
  }

  const matches: Match[] = []

  for (const request of requests) {
    if (
      request.origin_lat == null ||
      request.origin_lng == null ||
      request.destination_lat == null ||
      request.destination_lng == null
    ) continue

    const pickupPoint = {
      latitude: request.origin_lat,
      longitude: request.origin_lng
    }

    const dropoffPoint = {
      latitude: request.destination_lat,
      longitude: request.destination_lng
    }

    // בדיקת קרבה למסלול
       const pickupIndex = routePoints.findIndex((p: { latitude: number; longitude: number }) =>
      getDistance(p, pickupPoint) <= MAX_PICKUP_DISTANCE_METERS
    )
    const dropoffIndex = routePoints.findIndex((p: { latitude: number; longitude: number }) =>
      getDistance(p, dropoffPoint) <= MAX_PICKUP_DISTANCE_METERS
    )
    
    // האם הנוסע מתחיל קרוב למסלול ונגמר לאחר מכן
    if (pickupIndex !== -1 && dropoffIndex !== -1 && dropoffIndex > pickupIndex) {
      matches.push({
        ride_id: ride.id,
        request_id: request.id,
        distance_offset_km: null, // ניתן לחשב סטייה מדויקת בהמשך
        time_offset_min: null,
        created_at: new Date().toISOString()      
      })
    }
  }

  // שלב 3: שמירת התאמות בבסיס הנתונים
  await Promise.all(
    matches.map(match => supabase.from('matches').upsert(match))
  )

  return matches
}
