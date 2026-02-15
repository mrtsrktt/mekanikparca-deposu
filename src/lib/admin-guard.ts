import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 }), session: null }
  }
  return { error: null, session }
}
