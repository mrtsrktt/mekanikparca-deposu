import AdminLayoutClient from './AdminLayoutClient'

export const metadata = { title: 'Admin Panel | Mekanik Parça Deposu' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
