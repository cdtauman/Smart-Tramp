// src/features/rides/RideCreationForm.tsx
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getPolyline } from '@/lib/getPolyline'

interface RideFormState {
  name: string
  phone: string
  origin: string
  destination: string
  datetime: string
  seats: number
  showPhone: boolean
  femaleOnly: boolean
}

export default function RideCreationForm() {
  const [form, setForm] = useState<RideFormState>({
    name: '',
    phone: '',
    origin: '',
    destination: '',
    datetime: '',
    seats: 1,
    showPhone: true,
    femaleOnly: false
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Step 1: צור נהג חדש
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        name: form.name,
        phone: form.phone || null,
        role: 'driver',
        show_phone: form.showPhone,
        female_only: form.femaleOnly
      }])
      .select()
      .single()

    if (userError) {
      alert('שגיאה ביצירת הנהג')
      setLoading(false)
      return
    }

    // Step 2: שלוף polyline מה-API של גוגל
    const polyline = await getPolyline(form.origin, form.destination)
    if (!polyline) {
      alert('לא נמצא מסלול חוקי בין הכתובות')
      setLoading(false)
      return
    }

    // Step 3: צור מסלול
    const { error: rideError } = await supabase
      .from('rides')
      .insert([{
        driver_id: user.id,
        origin: form.origin,
        destination: form.destination,
        datetime: new Date(form.datetime).toISOString(),
        seats: parseInt(form.seats.toString()),
        polyline: polyline
      }])

    if (rideError) {
      alert('שגיאה בשמירת המסלול')
    } else {
      setSubmitted(true)
    }

    setLoading(false)
  }

  if (submitted) return <p className="text-green-600">המסלול נשמר בהצלחה!</p>

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 rtl text-right">
      <input name="name" required placeholder="שם" onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="phone" placeholder="טלפון" onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="origin" required placeholder="כתובת מוצא" onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="destination" required placeholder="כתובת יעד" onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="datetime" required type="datetime-local" onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="seats" required type="number" min={1} defaultValue={1} onChange={handleChange} className="w-full border p-2 rounded" />
      <label className="block">
        <input type="checkbox" name="femaleOnly" onChange={handleChange} /> רק נוסעות
      </label>
      <label className="block">
        <input type="checkbox" name="showPhone" checked={form.showPhone} onChange={handleChange} /> אפשר להציג את מספר הטלפון שלי
      </label>
      <button type="submit" disabled={loading} className="bg-green-600 text-white p-2 rounded w-full">
        {loading ? 'שומר...' : 'צור מסלול'}
      </button>
    </form>
  )
}
