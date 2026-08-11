'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } finally {
      window.location.href = '/admin'
    }
  }

  return (
    <Button variant="secondary" onClick={handleLogout} disabled={loading}>
      {loading ? 'Logging out…' : 'Log out'}
    </Button>
  )
}
