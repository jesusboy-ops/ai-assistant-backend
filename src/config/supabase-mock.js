/**
 * Mock Supabase client for testing without database
 */

const mockSupabase = {
  from: (table) => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Database not available' } }),
        limit: () => Promise.resolve({ data: [], error: null })
      }),
      limit: () => Promise.resolve({ data: [], error: null }),
      range: () => Promise.resolve({ data: [], error: null }),
      order: () => ({
        range: () => Promise.resolve({ data: [], error: null })
      })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Database not available' } })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Database not available' } })
        })
      })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: { message: 'Database not available' } })
    })
  }),
  
  rpc: () => Promise.resolve({ data: null, error: { message: 'Database not available' } }),
  
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Storage not available' } }),
      getPublicUrl: () => ({ data: { publicUrl: 'mock-url' } })
    })
  }
};

module.exports = { supabase: mockSupabase };