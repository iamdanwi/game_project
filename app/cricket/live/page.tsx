import { Suspense } from 'react'
import LiveMatch from './components/LiveMatch'

export default function LiveMatchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LiveMatch />
    </Suspense>
  )
}

