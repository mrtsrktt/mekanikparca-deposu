'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import GiftCampaignForm from '../GiftCampaignForm'

export default function EditGiftCampaignPage() {
  const params = useParams()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/gift-campaigns/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setCampaign(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
  }

  if (!campaign) {
    return <div className="text-center py-12 text-red-500">Kampanya bulunamadı.</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🎁 Kampanya Düzenle: {campaign.name}</h1>
      <GiftCampaignForm initial={campaign} isEdit />
    </div>
  )
}
