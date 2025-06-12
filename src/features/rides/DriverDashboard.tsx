// src/features/rides/DriverDashboard.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import DriverMap from '@/components/DriverMap'

export default function DriverDashboard({ driverId }: { driverId: string }) {
  const [rides, setRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: ridesData, error } = await supabase
        .from('rides')
        .select(`
          *,
          matches (
            *,
            requests (
              *,
              users (
                name, phone, show_phone
              )
            )
          )
        `)
        .eq('driver_id', driverId)

      if (error) {
        console.error(error)
      } else {
        setRides(ridesData || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [driverId])

  const handleApprove = async (requestId: string) => {
    const { error } = await supabase
      .from('requests')
      .update({ status: 'matched' })
      .eq('id', requestId)

    if (error) {
      alert('שגיאה באישור הטרמפ')
      console.error(error)
    } else {
      setRides(prev =>
        prev.map(ride => ({
          ...ride,
          matches: ride.matches.map(m =>
            m.requests.id === requestId
              ? { ...m, requests: { ...m.requests, status: 'matched' } }
              : m
          )
        }))
      )
    }
  }

  const handleIgnore = async (requestId: string) => {
    const { error } = await supabase
      .from('requests')
      .update({ status: 'ignored' })
      .eq('id', requestId)

    if (error) {
      alert('שגיאה בהתעלמות')
      console.error(error)
    } else {
      setRides(prev =>
        prev.map(ride => ({
          ...ride,
          matches: ride.matches.filter(m => m.requests.id !== requestId)
        }))
      )
    }
  }

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    )
    const data = await res.json()
    if (data.results && data.results[0]) {
      const loc = data.results[0].geometry.location
      return { lat: loc.lat, lng: loc.lng }
    }
    return null
  }

  if (loading) return <p>טוען...</p>
  if (rides.length === 0) return <p>אין מסלולים עדיין.</p>

  return (
    <div className="rtl space-y-6 max-w-3xl mx-auto text-right">
      {rides.map((ride) => {
        const [pickupPoints, setPickupPoints] = useState<{ lat: number; lng: number }[]>([])

        useEffect(() => {
          const loadPickupPoints = async () => {
            const results: { lat: number; lng: number }[] = []
            for (const m of ride.matches || []) {
              const origin = m.requests.origin
              const loc = await geocodeAddress(origin)
              if (loc) results.push(loc)
            }
            setPickupPoints(results)
          }
          loadPickupPoints()
        }, [ride.id])

        return (
          <div key={ride.id} className="border rounded p-4 shadow space-y-4">
            <h2 className="text-xl font-bold">מסלול: {ride.origin} → {ride.destination}</h2>
            <p>תאריך: {new Date(ride.datetime).toLocaleString()}</p>
            <p>מקומות פנויים: {ride.seats}</p>

            <DriverMap polyline={ride.polyline} pickupPoints={pickupPoints} />

            <h3 className="mt-4 font-semibold">נוסעים אפשריים:</h3>
            {(!ride.matches || ride.matches.length === 0) && <p>אין התאמות כרגע.</p>}

            <ul className="space-y-3">
              {ride.matches?.map(m => {
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
                        onClick={() => handleApprove(req.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        ✔ אשר
                      </button>
                      <button
                        onClick={() => handleIgnore(req.id)}
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
      })}
    </div>
  )
}
