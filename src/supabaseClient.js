import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jnkurweclmxlbfrjxmsb.supabase.co'
const supabaseKey = 'sb_publishable_WhO3hH0sLwnXQ7hoxdI9Ow_WymgVtoC'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 1 // Lowering this can help stability on mobile networks
    }
  }
})