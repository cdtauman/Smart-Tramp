import { describe, it, expect, vi, beforeEach } from 'vitest'
import { matchRequestsToRide } from '../src/lib/matchRequestsToRide'
import * as supabaseClient from '../src/lib/supabaseClient'
import type { Match } from '../src/types'

describe('matchRequestsToRide', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns matches for valid requests along route', async () => {
    vi.spyOn(supabaseClient, 'supabase', 'get').mockReturnValue({
      from: () => ({
        select: () => ({ eq: () => ({ single: () => ({ data: { id: 'ride1', polyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@' }, error: null }) }) })
      })
    } as any)

    const result = await matchRequestsToRide('ride1')
    expect(Array.isArray(result)).toBe(true)
  })
})