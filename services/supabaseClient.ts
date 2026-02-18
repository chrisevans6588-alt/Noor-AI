
// This file is deprecated. Please use services/firebaseClient.ts for all backend operations.
export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: new Error("Supabase removed") }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: async () => {},
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) })
  })
};
