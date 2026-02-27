export const metadata = {
  title: 'Güvenli Ödeme - Mekanik Parça Deposu',
}

export default function IframeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}