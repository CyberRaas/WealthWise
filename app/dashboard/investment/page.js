'use client'

import dynamic from 'next/dynamic'
import DashboardLayout from '@/components/layout/DashboardLayout'

// Dynamic import with SSR disabled to prevent Recharts/PDF issues
const InvestmentSimulator = dynamic(
    () => import('@/components/dashboard/InvestmentSimulator'),
    { ssr: false }
)

export default function InvestmentPage() {
    return (
        <DashboardLayout title="Investment">
            <InvestmentSimulator />
        </DashboardLayout>
    )
}
