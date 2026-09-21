/**
 * SALT OKUNUR dogrulama scripti.
 *
 * Amac: canli (Neon) veritabaninda iki katmanli bayi sisteminin verisini
 * ve fiyat yolunu dogrulamak. HICBIR SEY YAZMAZ/SILMEZ.
 *
 * Calistirma: npx tsx --conditions=react-server scripts/verify-dealer-system.ts
 */
import { PrismaClient } from '@prisma/client'
import {
  resolveDiscountPercent,
  DEFAULT_DEALER_DISCOUNTS,
  DEALER_DISCOUNT_KEYS,
} from '../src/lib/dealerDiscount'
import { calculateB2BPrice } from '../src/lib/b2bPricing'

const prisma = new PrismaClient()

function line() {
  console.log('-'.repeat(64))
}

async function main() {
  let failures = 0
  const fail = (msg: string) => {
    failures++
    console.log('  FAIL  ' + msg)
  }
  const ok = (msg: string) => console.log('  ok    ' + msg)

  // ---------------------------------------------------------------- 1
  console.log('\n[1] SiteSetting indirim ayarlari')
  line()
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: { in: ['dealer_discount_wholesaler', 'dealer_discount_service'] },
    },
    select: { key: true, value: true },
  })
  const settingsMap: Record<string, string | undefined> = {}
  for (const s of settings) settingsMap[s.key] = s.value

  if (settings.length === 0) {
    console.log('  (ayar yok -> varsayilanlar kullanilir)')
  }
  for (const k of Object.values(DEALER_DISCOUNT_KEYS)) {
    const v = settingsMap[k]
    console.log(`  ${k} = ${v === undefined ? '(yok)' : JSON.stringify(v)}`)
  }

  // Ayarlar varsa gecerli sayisal deger olmali.
  for (const k of Object.values(DEALER_DISCOUNT_KEYS)) {
    const v = settingsMap[k]
    if (v !== undefined && (Number.isNaN(Number(v)) || Number(v) < 0 || Number(v) > 100)) {
      fail(`${k} gecersiz deger iceriyor: ${JSON.stringify(v)}`)
    }
  }
  if (!failures) ok('indirim ayarlari gecerli (veya tanimsiz -> varsayilan)')

  // ---------------------------------------------------------------- 2
  console.log('\n[2] Cozulen oranlar (DB ayari -> uygulanacak oran)')
  line()
  const resolved: Record<string, number> = {
    WHOLESALER: resolveDiscountPercent(settingsMap, 'WHOLESALER'),
    SERVICE: resolveDiscountPercent(settingsMap, 'SERVICE'),
  }
  for (const t of ['WHOLESALER', 'SERVICE'] as const) {
    const expected =
      settingsMap[DEALER_DISCOUNT_KEYS[t]] !== undefined
        ? Number(settingsMap[DEALER_DISCOUNT_KEYS[t]])
        : DEFAULT_DEALER_DISCOUNTS[t]
    const got = resolved[t]
    console.log(`  ${t}: %${got}  (beklenen %${expected})`)
    if (got !== expected) fail(`${t} orani yanlis: %${got} != %${expected}`)
  }
  if (resolved.WHOLESALER <= resolved.SERVICE) {
    fail('Toptanci orani Servis oranindan buyuk olmali')
  } else {
    ok('Toptanci orani > Servis orani')
  }

  // ---------------------------------------------------------------- 3
  console.log('\n[3] Bayi kullanicilari (dealerType atanmis)')
  line()
  const dealers = await prisma.user.findMany({
    where: { dealerType: { in: ['WHOLESALER', 'SERVICE'] } },
    select: {
      id: true,
      email: true,
      dealerType: true,
      corporateApplications: {
        select: { status: true },
      },
    },
  })
  console.log(`  dealerType atanmis kullanici sayisi: ${dealers.length}`)
  for (const d of dealers) {
    const approved = d.corporateApplications.filter((a) => a.status === 'APPROVED').length
    console.log(
      `   - ${d.dealerType?.padEnd(10)} approved=${approved}  ${d.email ?? d.id}`
    )
    if (approved === 0) {
      fail(`${d.email ?? d.id}: dealerType var ama APPROVED basvuru yok -> UI bayi gorunmez`)
    }
  }
  if (dealers.length > 0 && !failures) ok('tum bayi kullanicilarinin onayli basvurusu var')

  // ---------------------------------------------------------------- 4
  console.log('\n[4] Onayli basvurularda dealerType dagilimi')
  line()
  const apps = await prisma.corporateApplication.findMany({
    where: { status: 'APPROVED' },
    select: { dealerType: true, userId: true },
  })
  const byType: Record<string, number> = {}
  let nullType = 0
  for (const a of apps) {
    if (a.dealerType === null) nullType++
    else byType[a.dealerType] = (byType[a.dealerType] ?? 0) + 1
  }
  console.log(`  APPROVED basvuru: ${apps.length}`)
  console.log(`   WHOLESALER: ${byType.WHOLESALER ?? 0}`)
  console.log(`   SERVICE   : ${byType.SERVICE ?? 0}`)
  console.log(`   (tursuz)  : ${nullType}`)
  // Turu olmayan onayli basvurular bayi sayilmaz; bilgi amacli.

  // ---------------------------------------------------------------- 5
  console.log('\n[5] Fiyat yolu simulasyonu (gercek urunlerle)')
  line()
  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: 3,
    orderBy: { priceTRY: 'desc' },
    select: { name: true, priceTRY: true },
  })
  if (products.length === 0) fail('aktif urun bulunamadi')
  for (const p of products) {
    const retail = Number(p.priceTRY)
    const w = calculateB2BPrice(retail, resolved.WHOLESALER)
    const s = calculateB2BPrice(retail, resolved.SERVICE)
    console.log(`  ${p.name.slice(0, 42)}`)
    console.log(`    perakende : ${retail.toFixed(2)}`)
    console.log(`    toptanci  : ${w.b2bPrice.toFixed(2)}  (%${w.discountPercent}, kazanc ${w.savings.toFixed(2)})`)
    console.log(`    servis    : ${s.b2bPrice.toFixed(2)}  (%${s.discountPercent}, kazanc ${s.savings.toFixed(2)})`)
    // Matematiksel tutarlilik kontrolu
    const expectedW = Math.round(retail * (1 - resolved.WHOLESALER / 100) * 100) / 100
    if (Math.abs(w.b2bPrice - expectedW) > 0.011) {
      fail(`${p.name}: toptanci fiyat hesabi tutarsiz (${w.b2bPrice} != ${expectedW})`)
    }
    if (w.b2bPrice >= s.b2bPrice) {
      fail(`${p.name}: toptanci fiyati servis fiyatindan dusuk olmali`)
    }
  }
  if (!failures) ok('fiyat hesaplari matematiksel olarak tutarli')

  // ---------------------------------------------------------------- 6
  console.log('\n[6] Ozellik bayragi (kurumsal basvuru aktif mi?)')
  line()
  const flag = await prisma.siteSetting.findUnique({
    where: { key: 'ENABLE_CORPORATE_APPLICATION' },
    select: { value: true },
  })
  console.log(`  ENABLE_CORPORATE_APPLICATION = ${flag?.value ?? '(yok)'}`)
  const enabled = flag?.value === 'true' || flag?.value === '1'
  if (!enabled) {
    fail('ozellik bayragi kapali -> /api/corporate/dealer-info 404 doner, indirim uygulanmaz')
  } else {
    ok('ozellik bayragi acik')
  }

  // ---------------------------------------------------------------- SONUC
  console.log('\n' + '='.repeat(64))
  if (failures === 0) {
    console.log('SONUC: TUM DOGRULAMALAR GECTI')
  } else {
    console.log(`SONUC: ${failures} KONTROL BASARISIZ`)
  }
  console.log('='.repeat(64))
}

main()
  .catch((e) => {
    console.error('Beklenmeyen hata:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
