'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import CampaignForm from '../CampaignForm'

export default function EditCampaignPage() {
  const params = useParams()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/campaigns/${params.id}`)
      .then(r => r.json())
      .then(data => { setCampaign(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="text-center py-16">Yükleniyor...</div>
  if (!campaign) return <div className="text-center py-16 text-red-500">Kampanya bulunamadı.</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kampanya Düzenle</h1>
      <CampaignForm initial={campaign} isEdit />
    </div>
  )
}
