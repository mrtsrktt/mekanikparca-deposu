import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Kampanya sayfaları geçici olarak gizlendi — doğrudan URL erişimi de ana sayfaya yönlendirilir.
// Yeniden açmak için bu dosyayı silmek (veya matcher'ı kaldırmak) yeterli.
// Not: /admin/kampanyalar ve /admin/hediye-kampanyalari ETKİLENMEZ (yalnızca public /kampanyalar).
export function middleware(req: NextRequest) {
  return NextResponse.redirect(new URL('/', req.url))
}

export const config = {
  matcher: ['/kampanyalar', '/kampanyalar/:path*'],
}
