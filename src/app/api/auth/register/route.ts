import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { isCorporateApplicationEnabled } from '@/lib/featureFlags'
import { createCorporateApplication } from '@/lib/corporateApplicationService'
import { validateCorporateApplication } from '@/lib/corporateApplicationValidation'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name, phone, isCorporate, corporateData } = body

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı.' }, { status: 400 })
    }

    if (isCorporate === true) {
      // Kurumsal başvuru kapalıysa kullanıcı oluşturulmadan hata dön
      if (!isCorporateApplicationEnabled()) {
        return NextResponse.json(
          { error: 'Kurumsal başvuru alımı şu anda kapalıdır.' },
          { status: 400 }
        )
      }

      // Kurumsal alan doğrulama hatası (INVALID_INPUT) olursa kullanıcı oluşturulmadan anlaşılır hata dönsün.
      const validation = validateCorporateApplication(corporateData)
      if (!validation.success) {
        const firstError =
          Object.values(validation.errors)[0]?.[0] || 'Geçersiz kurumsal başvuru bilgileri.'
        return NextResponse.json(
          { error: firstError, details: validation.errors },
          { status: 400 }
        )
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, phone, role: 'CUSTOMER' },
    })

    let corporateApplication = null
    if (isCorporate === true) {
      const appResult = await createCorporateApplication(prisma, {
        userId: user.id,
        form: corporateData,
      })

      if (!appResult.ok) {
        // createCorporateApplication başarısız olursa oluşturulan kullanıcı silinir
        await prisma.user.delete({ where: { id: user.id } })

        if (appResult.reason === 'INVALID_INPUT') {
          return NextResponse.json(
            { error: 'Geçersiz kurumsal başvuru bilgileri.', details: appResult.errors },
            { status: 400 }
          )
        }
        if (appResult.reason === 'ACTIVE_APPLICATION_EXISTS') {
          return NextResponse.json(
            { error: 'Aktif kurumsal başvurunuz bulunmaktadır.' },
            { status: 409 }
          )
        }
        return NextResponse.json(
          { error: 'Kurumsal başvuru oluşturulamadı. Lütfen tekrar deneyin.' },
          { status: 500 }
        )
      }

      corporateApplication = appResult.application
    }

    return NextResponse.json({
      message: isCorporate
        ? 'Kurumsal başvurunuz ve kaydınız başarıyla alındı! Yönetici onayından sonra bayi avantajlarınız aktifleşecektir.'
        : 'Kayıt başarılı.',
      userId: user.id,
      ...(corporateApplication ? { corporateApplication } : {}),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 })
  }
}
