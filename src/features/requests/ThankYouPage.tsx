// src/features/requests/ThankYouPage.tsx
import { useEffect, useState } from 'react'
import PassengerStatus from './PassengerStatus'

export default function ThankYouPage() {
  const [phone, setPhone] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('passenger_phone')
    if (stored) setPhone(stored)
  }, [])

  if (!phone) return (
    <div className="rtl text-center p-6">
      <h2 className="text-xl font-bold mb-4">הבקשה נשלחה ✅</h2>
      <p>כדי לעקוב אחרי הטרמפ שלך, שמור את המספר איתו ביקשת.</p>
    </div>
  )

  return (
    <div className="rtl p-6">
      <h2 className="text-xl font-bold mb-4 text-center">הבקשה נשלחה בהצלחה! 🚀</h2>
      <PassengerStatus phone={phone} />
    </div>
  )
}
