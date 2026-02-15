'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const settingKeys = [
  { key: 'site_name', label: 'Site Adı', type: 'text' },
  { key: 'site_description', label: 'Site Açıklaması', type: 'textarea' },
  { key: 'phone', label: 'Telefon', type: 'text' },
  { key: 'email', label: 'E-posta', type: 'text' },
  { key: 'address', label: 'Adres', type: 'textarea' },
  { key: 'whatsapp', label: 'WhatsApp Numarası', type: 'text' },
  { key: 'facebook', label: 'Facebook URL', type: 'text' },
  { key: 'instagram', label: 'Instagram URL', type: 'text' },
  { key: 'twitter', label: 'Twitter URL', type: 'text' },
  { key: 'google_analytics', label: 'Google Analytics ID', type: 'text' },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then((data: any[]) => {
      const map: Record<string, string> = {}
      data.forEach(s => { map[s.key] = s.value })
      setSettings(map)
    })
  }, [])

  const saveSetting = async (key: string) => {
    await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: settings[key] || '' })
    })
    toast.success('Ayar kaydedildi.')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Site Ayarları</h1>
      <div className="card p-6 space-y-6">
        {settingKeys.map((s) => (
          <div key={s.key} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">{s.label}</label>
              {s.type === 'textarea' ? (
                <textarea rows={2} className="input-field" value={settings[s.key] || ''}
                  onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })} />
              ) : (
                <input type="text" className="input-field" value={settings[s.key] || ''}
                  onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })} />
              )}
            </div>
            <button onClick={() => saveSetting(s.key)} className="btn-primary flex-shrink-0">Kaydet</button>
          </div>
        ))}
      </div>
    </div>
  )
}
