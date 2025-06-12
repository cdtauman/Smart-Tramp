// src/features/requests/RideRequestForm.tsx
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ThankYouPage from './ThankYouPage'

export default function RideRequestForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    origin: '',
    destination: '',
    datetime: '',
    femaleOnly: false,
    showPhone: false
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const geocode = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.results && data.results.length > 0) {
      const loc = data.results[0].geometry.location
      return { lat: loc.lat, lng: loc.lng }
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Step 1: צור משתמש זמני
    const { data: userInsert, error: userError } = await supabase
      .from('users')
      .insert([{
        name: form.name,
        phone: form.phone || null,
        role: 'passenger',
        show_phone: form.showPhone,
        female_only: form.femaleOnly
      }])
      .select()
      .single()

    if (userError) {
      alert('שגיאה ביצירת משתמש')
      setLoading(false)
      return
    }

    // Step 2: גיאוקוד
    const pickup = await geocode(form.origin)
    const dropoff = await geocode(form.destination)

    if (!pickup || !dropoff) {
      alert('כתובות לא תקינות')
      setLoading(false)
      return
    }

    // Step 3: שלח את הבקשה
    const { error: reqError } = await supabase
      .from('requests')
      .insert([{
        passenger_id: userInsert.id,
        origin: form.origin,
        destination: form.destination,
        datetime: form.datetime ? new Date(form.datetime).toISOString() : null,
        status: 'pending',
        origin_lat: pickup.lat,
        origin_lng: pickup.lng,
        destination_lat: dropoff.lat,
        destination_lng: dropoff.lng
      }])

    if (reqError) {
      alert('שגיאה בשליחת הבקשה')
    } else {
      if (form.phone) {
        localStorage.setItem('passenger_phone', form.phone)
      }
      setSubmitted(true)
    }

    setLoading(false)
  }

  if (submitted) return <ThankYouPage />

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 rtl text-right">
      <input name="name" required placeholder="שם" onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="phone" placeholder="טלפון (לא חובה)" onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="origin" required placeholder="כתובת מוצא" onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="destination" required placeholder="כתובת יעד" onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="datetime" type="datetime-local" onChange={handleChange} className="w-full border p-2 rounded" />
      <label className="block">
        <input type="checkbox" name="femaleOnly" onChange={handleChange} /> בקשה מטרמפיסטית בלבד
      </label>
      <label className="block">
        <input type="checkbox" name="showPhone" onChange={handleChange} /> אפשר להציג את מספר הטלפון שלי לנהג
      </label>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded w-full">
        {loading ? 'שולח...' : 'שלח בקשה'}
      </button>
    </form>
  )
}
