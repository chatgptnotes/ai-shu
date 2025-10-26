// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '',
}))

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mdzavfrynjjivxvvibnr.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kemF2ZnJ5bmpqaXZ4dnZpYm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2OTI2OTYsImV4cCI6MjA3MjI2ODY5Nn0.ssNz1yCkwCulC454m2d87fRbo8WnSoWisHn7u510eiE'

// Global test timeout
jest.setTimeout(10000)
