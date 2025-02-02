import type { Metadata } from 'next'

import { AdminPanel } from '@/components/AdminPanel'

export const metadata: Metadata = {
  title: 'Admin Panel',
}

export default function AdminPage() {
  return <AdminPanel />
}
