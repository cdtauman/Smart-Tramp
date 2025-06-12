// src/components/DriverMap.tsx
import { GoogleMap, LoadScript, Polyline, Marker } from '@react-google-maps/api'
import polylineDecode from '@mapbox/polyline'

const containerStyle = {
  width: '100%',
  height: '400px'
}

const centerFallback = {
  lat: 32.0853,
  lng: 34.7818 // תל אביב כברירת מחדל
}

export default function DriverMap({ polyline, pickupPoints = [] }: {
  polyline: string,
  pickupPoints?: { lat: number; lng: number }[]
}) {
  const decodedPath = polylineDecode.decode(polyline).map(
    ([lat, lng]: [number, number]) => ({ lat, lng })
  )
  const center = decodedPath[Math.floor(decodedPath.length / 2)] || centerFallback

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
        <Polyline
          path={decodedPath}
          options={{
            strokeColor: '#1E90FF',
            strokeOpacity: 0.8,
            strokeWeight: 4
          }}
        />
        {pickupPoints.map((point, index) => (
          <Marker key={index} position={point} />
        ))}
      </GoogleMap>
    </LoadScript>
  )
}