// src/features/rides/DriverDashboard.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import RideCard from './RideCard'
import type { RideWithMatches } from '@/types'

export default function DriverDashboard() {
  const { driverId } = useParams() as { driverId?: string }
  const [rides, setRides] = useState<RideWithMatches[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!driverId) return
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
          matches: ride.matches.map((m: RideWithMatches['matches'][number]) =>
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
          matches: ride.matches.filter(
            (m: RideWithMatches['matches'][number]) => m.requests.id !== requestId
          )        
        }))
      )
    }
  }

  if (loading) return <p>טוען...</p>
  if (!driverId) return <p>מספר נהג חסר</p>
  if (rides.length === 0) return <p>אין מסלולים עדיין.</p>

  return (
    <div className="rtl space-y-6 max-w-3xl mx-auto text-right">
      {rides.map((ride) => (
        <RideCard
          key={ride.id}
          ride={ride}
          onApprove={handleApprove}
          onIgnore={handleIgnore}
        />
      ))}
    </div>
  )
}
