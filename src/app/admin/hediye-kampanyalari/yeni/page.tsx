import GiftCampaignForm from '../GiftCampaignForm'

export const metadata = {
  title: 'Yeni Hediye Kampanyası | Admin',
}

export default function NewGiftCampaignPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🎁 Yeni Hediye Kampanyası</h1>
      <GiftCampaignForm />
    </div>
  )
}
