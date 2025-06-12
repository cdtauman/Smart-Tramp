import { describe, it, expect } from 'vitest'
import * as env from '../src/lib/env'

describe('env module', () => {
  it('exposes Supabase and Google Maps keys', () => {
    expect(env.SUPABASE_URL).toBeDefined()
    expect(env.SUPABASE_ANON_KEY).toBeDefined()
    expect(env.GOOGLE_MAPS_API_KEY).toBeDefined()
  })
})