// src/lib/matchRequestsToRide.ts
import { supabase } from '@/lib/supabaseClient'
import polyline from '@mapbox/polyline'
import { getDistance } from 'geolib'

const MAX_PICKUP_DISTANCE_METERS = 1000 // מקסימום מרחק מותר מהמסלול

export async function matchRequestsToRide(rideId: string) {
  // שלב 1: שליפת המסלול
  const { data: ride, error: rideError } = await supabase
    .from('rides')
    .select('*')
    .eq('id', rideId)
    .single()

  if (rideError || !ride) {
    console.error('Ride not found', rideError)
    return
  }

  const routePoints = polyline.decode(ride.polyline).map(
    ([lat, lng]) => ({ latitude: lat, longitude: lng })
  )

  // שלב 2: שליפת כל הבקשות הפנדינג עם מיקומים
  const { data: requests, error: reqError } = await supabase
    .from('requests')
    .select('*')
    .eq('status', 'pending')

  if (reqError || !requests) {
    console.error('Failed to fetch requests', reqError)
    return
  }

  const matches = []

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
    const pickupIndex = routePoints.findIndex(p => getDistance(p, pickupPoint) <= MAX_PICKUP_DISTANCE_METERS)
    const dropoffIndex = routePoints.findIndex(p => getDistance(p, dropoffPoint) <= MAX_PICKUP_DISTANCE_METERS)

    // האם הנוסע מתחיל קרוב למסלול ונגמר לאחר מכן
    if (pickupIndex !== -1 && dropoffIndex !== -1 && dropoffIndex > pickupIndex) {
      matches.push({
        ride_id: ride.id,
        request_id: request.id,
        distance_offset_km: null, // ניתן לחשב סטייה מדויקת בהמשך
        time_offset_min: null
      })
    }
  }

  // שלב 3: שמירת התאמות בבסיס הנתונים
  for (const match of matches) {
    await supabase.from('matches').upsert(match)
  }

  return matches
}
