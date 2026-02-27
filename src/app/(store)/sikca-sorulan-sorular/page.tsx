export default function SSSCikcaSorulanSorularPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Sıkça Sorulan Sorular</h1>
      
      <div className="card p-8">
        <p className="text-gray-600 text-center mb-8">
          Sıkça sorulan sorularımızı bu sayfada bulabilirsiniz. 
          Aradığınız cevabı bulamazsanız, lütfen bizimle iletişime geçin.
        </p>
        
        <div className="space-y-6">
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-3">Sipariş Süreci</h2>
            <p className="text-gray-600">
              Sipariş süreci ile ilgili detaylı bilgiler yakında eklenecektir.
            </p>
          </div>
          
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-3">Teslimat ve Kargo</h2>
            <p className="text-gray-600">
              Teslimat ve kargo bilgileri yakında eklenecektir.
            </p>
          </div>
          
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-3">Ödeme Seçenekleri</h2>
            <p className="text-gray-600">
              Ödeme seçenekleri ile ilgili bilgiler yakında eklenecektir.
            </p>
          </div>
          
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-3">İade ve Değişim</h2>
            <p className="text-gray-600">
              İade ve değişim politikamız ile ilgili detaylar yakında eklenecektir.
            </p>
          </div>
          
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-3">Teknik Destek</h2>
            <p className="text-gray-600">
              Teknik destek ve garanti bilgileri yakında eklenecektir.
            </p>
          </div>
          
          <div className="pt-6">
            <h2 className="text-xl font-semibold mb-3">Daha Fazla Sorunuz Mu Var?</h2>
            <p className="text-gray-600 mb-4">
              Yukarıdaki sorulara cevap bulamadıysanız, lütfen bizimle iletişime geçin.
            </p>
            <a 
              href="/iletisim" 
              className="inline-block btn-primary"
            >
              İletişim Sayfasına Git
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}