// src/features/rides/RideCard.tsx
import { useEffect, useState } from 'react'
import DriverMap from '@/components/DriverMap'

interface RideCardProps {
  ride: any
  onApprove: (id: string) => void
  onIgnore: (id: string) => void
}

export default function RideCard({ ride, onApprove, onIgnore }: RideCardProps) {
  const [pickupPoints, setPickupPoints] = useState<{ lat: number; lng: number }[]>([])

  useEffect(() => {
    const loadPickupPoints = async () => {
      const results: { lat: number; lng: number }[] = []
      for (const m of ride.matches || []) {
        const loc = await geocodeAddress(m.requests.origin)
        if (loc) results.push(loc)
      }
      setPickupPoints(results)
    }
    loadPickupPoints()
  }, [ride.id])

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      )
      if (!res.ok) {
        console.error('Geocode failed', res.statusText)
        return null
      }
      const data = await res.json()
      if (data.results && data.results[0]) {
        const loc = data.results[0].geometry.location
        return { lat: loc.lat, lng: loc.lng }
      }
    } catch (err) {
      console.error('Geocode error', err)
    }
    return null
  }

  return (
    <div className="border rounded p-4 shadow space-y-4">
      <h2 className="text-xl font-bold">מסלול: {ride.origin} → {ride.destination}</h2>
      <p>תאריך: {new Date(ride.datetime).toLocaleString()}</p>
      <p>מקומות פנויים: {ride.seats}</p>

      <DriverMap polyline={ride.polyline} pickupPoints={pickupPoints} />

      <h3 className="mt-4 font-semibold">נוסעים אפשריים:</h3>
      {(!ride.matches || ride.matches.length === 0) && <p>אין התאמות כרגע.</p>}

      <ul className="space-y-3">
        {ride.matches?.map((m: any) => {
          const req = m.requests
          const user = req.users
          return (
            <li key={req.id} className="border p-3 rounded bg-gray-50">
              <p><strong>{user.name}</strong></p>
              <p>מ: {req.origin}</p>
              <p>אל: {req.destination}</p>
              {m.time_offset_min && <p>סטייה: {m.time_offset_min} דקות</p>}
              {user.show_phone && user.phone && (
                <p>📞 <a href={`tel:${user.phone}`} className="text-blue-600 underline">{user.phone}</a></p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onApprove(req.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  ✔ אשר
                </button>
                <button
                  onClick={() => onIgnore(req.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  ✖ התעלם
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}