'use client'

import { FiPhone, FiMail, FiMapPin, FiClock, FiSmartphone } from 'react-icons/fi'

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">İletişim</h1>
      <p className="text-gray-500 mb-8">İKİ M İKLİMLENDİRME SİSTEMLERİ TİCARET LİMİTED ŞİRKETİ</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol: Bilgiler + Harita */}
        <div className="space-y-6">
          <div className="card p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 rounded-lg"><FiMapPin className="w-5 h-5 text-primary-500" /></div>
              <div>
                <h3 className="font-semibold">Adres</h3>
                <p className="text-sm text-gray-500">Atatürk Mah. Alemdağ Cad. No:140-144 İç Kapı No:19</p>
                <p className="text-sm text-gray-500">Ümraniye, İstanbul – Türkiye</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 rounded-lg"><FiPhone className="w-5 h-5 text-primary-500" /></div>
              <div>
                <h3 className="font-semibold">Telefon</h3>
                <p className="text-sm text-gray-500">
                  <a href="tel:02162324052" className="hover:text-primary-500 transition-colors">0216 232 40 52</a>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 rounded-lg"><FiSmartphone className="w-5 h-5 text-primary-500" /></div>
              <div>
                <h3 className="font-semibold">Cep / WhatsApp</h3>
                <p className="text-sm text-gray-500">
                  <a href="tel:05326404086" className="hover:text-primary-500 transition-colors">0532 640 40 86</a>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 rounded-lg"><FiMail className="w-5 h-5 text-primary-500" /></div>
              <div>
                <h3 className="font-semibold">E-posta</h3>
                <p className="text-sm text-gray-500">
                  <a href="mailto:info@2miklimlendirme.com.tr" className="hover:text-primary-500 transition-colors">info@2miklimlendirme.com.tr</a>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 rounded-lg"><FiClock className="w-5 h-5 text-primary-500" /></div>
              <div>
                <h3 className="font-semibold">Çalışma Saatleri</h3>
                <p className="text-sm text-gray-500">Pazartesi - Cumartesi: 08:30 - 18:00</p>
                <p className="text-sm text-gray-500">Pazar: Kapalı</p>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="card overflow-hidden">
            <iframe
              src="https://maps.google.com/maps?q=Atat%C3%BCrk+Mah+Alemda%C4%9F+Cad+No+140+%C3%9Cmraniye+%C4%B0stanbul&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="İKİ M İklimlendirme Konum"
            />
          </div>
        </div>

        {/* Sağ: İletişim Formu */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold mb-4">Bize Yazın</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Ad Soyad" className="input-field" />
              <input type="email" placeholder="E-posta" className="input-field" />
            </div>
            <input type="tel" placeholder="Telefon" className="input-field" />
            <input type="text" placeholder="Konu" className="input-field" />
            <textarea placeholder="Mesajınız" rows={5} className="input-field" />
            <button type="submit" className="btn-primary w-full">Mesaj Gönder</button>
          </form>
        </div>
      </div>
    </div>
  )
}
