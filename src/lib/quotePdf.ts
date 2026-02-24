import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface QuoteItem {
  productName: string
  brandName?: string
  sku?: string
  quantity: number
  unitPrice: number
  note?: string
}

interface QuoteData {
  quoteNumber: string
  createdAt: string
  validUntil: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerCompany?: string
  items: QuoteItem[]
  adminNote?: string
  total: number
}

export function generateQuotePdf(data: QuoteData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const margin = 15

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(30, 64, 175) // primary blue
  doc.rect(0, 0, pageW, 32, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('MEKANİK PARÇA DEPOSU', margin, 13)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('İKİ M İKLİMLENDİRME SİSTEMLERİ TİCARET LTD. ŞTİ.', margin, 20)
  doc.text('Tel: 0216 232 40 52  |  GSM: 0532 640 40 86  |  info@2miklimlendirme.com.tr', margin, 26)

  // Teklif No (sağ üst)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('TEKLİF', pageW - margin, 13, { align: 'right' })
  doc.setFontSize(9)
  doc.text(data.quoteNumber, pageW - margin, 20, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Tarih: ${data.createdAt}`, pageW - margin, 26, { align: 'right' })

  // ── Müşteri & Geçerlilik ────────────────────────────────────────────────
  let y = 40

  doc.setTextColor(30, 30, 30)
  doc.setFillColor(245, 247, 250)
  doc.roundedRect(margin, y, pageW - margin * 2, 28, 2, 2, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 100, 100)
  doc.text('MÜŞTERİ BİLGİLERİ', margin + 4, y + 6)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(9)
  doc.text(data.customerName, margin + 4, y + 13)
  if (data.customerCompany) doc.text(data.customerCompany, margin + 4, y + 19)
  const contactLine = [data.customerPhone, data.customerEmail].filter(Boolean).join('  |  ')
  if (contactLine) doc.text(contactLine, margin + 4, y + (data.customerCompany ? 25 : 19))

  // Geçerlilik (sağ)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('GEÇERLİLİK SÜRESİ', pageW - margin - 4, y + 6, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(220, 38, 38)
  doc.setFontSize(9)
  doc.text(`3 gün (${data.validUntil} tarihine kadar)`, pageW - margin - 4, y + 13, { align: 'right' })

  y += 34

  // ── Ürün Tablosu ────────────────────────────────────────────────────────
  const tableBody = data.items.map((item, i) => [
    String(i + 1),
    item.productName + (item.brandName ? `\n${item.brandName}` : '') + (item.sku ? ` (${item.sku})` : ''),
    String(item.quantity),
    formatTRY(item.unitPrice),
    formatTRY(item.unitPrice * item.quantity),
    item.note || '',
  ])

  autoTable(doc, {
    startY: y,
    head: [['#', 'Ürün', 'Adet', 'Birim Fiyat', 'Toplam', 'Not']],
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 3, textColor: [30, 30, 30] },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 30 },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  })

  const finalY = (doc as any).lastAutoTable.finalY + 6

  // ── Toplam ──────────────────────────────────────────────────────────────
  doc.setFillColor(30, 64, 175)
  doc.roundedRect(pageW - margin - 70, finalY, 70, 12, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('GENEL TOPLAM:', pageW - margin - 38, finalY + 8)
  doc.text(formatTRY(data.total), pageW - margin - 2, finalY + 8, { align: 'right' })

  // ── Admin Notu ──────────────────────────────────────────────────────────
  if (data.adminNote) {
    const noteY = finalY + 20
    doc.setTextColor(30, 30, 30)
    doc.setFillColor(254, 252, 232)
    doc.roundedRect(margin, noteY, pageW - margin * 2, 18, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(120, 80, 0)
    doc.text('AÇIKLAMA:', margin + 4, noteY + 6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 60, 0)
    const lines = doc.splitTextToSize(data.adminNote, pageW - margin * 2 - 8)
    doc.text(lines, margin + 4, noteY + 12)
  }

  // ── Footer ──────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight()
  doc.setFillColor(245, 247, 250)
  doc.rect(0, pageH - 16, pageW, 16, 'F')
  doc.setTextColor(120, 120, 120)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('mekanikparcadeposu.com  |  Bu teklif bilgi amaçlıdır, fiyatlar değişkenlik gösterebilir.', pageW / 2, pageH - 6, { align: 'center' })

  doc.save(`Teklif-${data.quoteNumber}.pdf`)
}

function formatTRY(amount: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(amount)
}
