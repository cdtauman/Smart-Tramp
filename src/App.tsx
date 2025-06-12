// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RideRequestForm from './features/requests/RideRequestForm'
import RideCreationForm from './features/rides/RideCreationForm'
import ThankYouPage from './features/requests/ThankYouPage'
import PassengerStatus from './features/requests/PassengerStatus'
import DriverDashboard from './features/rides/DriverDashboard'

const StoredStatus = () => {
  const phone = localStorage.getItem('passenger_phone') || ''
  return <PassengerStatus phone={phone} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RideRequestForm />} />
        <Route path="/driver" element={<RideCreationForm />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/status" element={<StoredStatus />} />
        <Route path="/dashboard/:driverId" element={<DriverDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}