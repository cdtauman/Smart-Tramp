import { matchRequestsToRide } from '../src/lib/matchRequestsToRide'

declare const process: {
  argv: string[]
  exit(code?: number): never
}

const rideId = process.argv[2]
if (!rideId) {
  console.error('Usage: npm run match-ride <rideId>')
  process.exit(1)
}

matchRequestsToRide(rideId)
  .then(matches => {
    console.log(`Created ${matches.length} matches`) 
    for (const m of matches) {
      console.log(`Matched request ${m.request_id} to ride ${m.ride_id}`)
    }
  })
  .catch(err => {
    console.error('Failed to match ride', err)
    process.exit(1)
  })
  