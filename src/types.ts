
  id: string
  name: string
  phone: string | null
  role: 'driver' | 'passenger'
  show_phone: boolean
  female_only: boolean
  created_at: string
}

export interface Ride {
  id: string
  driver_id: string
  origin: string
  destination: string
  datetime: string
  seats: number
  polyline: string
  created_at: string
}

export interface Request {
  id: string
  passenger_id: string
  origin: string
  destination: string
  datetime: string | null
  status: 'pending' | 'matched' | 'ignored' | 'cancelled'
  matched_ride_id: string | null
  origin_lat: number | null
  origin_lng: number | null
  destination_lat: number | null
  destination_lng: number | null
  created_at: string
  users?: Pick<User, 'name' | 'phone' | 'show_phone'>
}

export interface Match {
  ride_id: string
  request_id: string
  distance_offset_km: number | null
  time_offset_min: number | null
  created_at: string
}

export interface RideWithMatches extends Ride {
  matches: {
    requests: Request
  }[]
}
