// src/features/requests/PassengerStatus.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function PassengerStatus({ phone }: { phone: string }) {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true)

      // שלב 1: מצא את הנוסע לפי מספר הטלפון
      const { data: users, error: userErr } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .eq('role', 'passenger')

      if (userErr || !users || users.length === 0) {
        setRequests([])
        setLoading(false)
        return
      }

      const passengerId = users[0].id

      // שלב 2: שלוף את הבקשות של הנוסע
      const { data: reqs, error: reqErr } = await supabase
        .from('requests')
        .select('*')
        .eq('passenger_id', passengerId)
        .order('created_at', { ascending: false })

      if (reqErr) {
        console.error(reqErr)
        setRequests([])
      } else {
        setRequests(reqs || [])
      }

      setLoading(false)
    }

    fetchStatus()
  }, [phone])

  if (loading) return <p>טוען מידע...</p>
  if (requests.length === 0) return <p>לא נמצאו בקשות פעילות.</p>

  return (
    <div className="rtl space-y-4 max-w-md mx-auto text-right">
      <h2 className="text-xl font-bold">הבקשות שלך:</h2>
      {requests.map(req => (
        <div key={req.id} className="border rounded p-4 shadow bg-gray-50">
          <p><strong>מ:</strong> {req.origin}</p>
          <p><strong>אל:</strong> {req.destination}</p>
          <p><strong>סטטוס:</strong> {translateStatus(req.status)}</p>
          <p><strong>זמן בקשה:</strong> {new Date(req.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}

function translateStatus(status: string) {
  switch (status) {
    case 'pending': return 'ממתין להתאמה'
    case 'matched': return 'נמצא טרמפ! 🎉'
    case 'ignored': return 'לא נמצא טרמפ 😞'
    case 'cancelled': return 'בוטל על ידי המשתמש'
    default: return status
  }
}
