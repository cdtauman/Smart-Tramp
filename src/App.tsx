// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RideRequestForm from './features/requests/RideRequestForm'
import RideCreationForm from './features/rides/RideCreationForm'
import ThankYouPage from './features/requests/ThankYouPage'
import PassengerStatus from './features/requests/PassengerStatus'
import DriverDashboard from './features/rides/DriverDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RideRequestForm />} />
        <Route path="/driver" element={<RideCreationForm />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/status" element={<PassengerStatus />} />
        <Route path="/dashboard" element={<DriverDashboard driverId="example-id" />} />
      </Routes>
    </BrowserRouter>
  )
}
