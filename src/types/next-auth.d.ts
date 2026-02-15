import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      b2bStatus: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    b2bStatus: string | null
    id: string
  }
}
