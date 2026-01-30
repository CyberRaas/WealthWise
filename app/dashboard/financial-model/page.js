'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import dynamic from 'next/dynamic'

const FinancialModel = dynamic(() => import('@/components/dashboard/FinancialModel'), { ssr: false })

export default function FinancialModelPage() {
    return (
        <DashboardLayout title="Omni-Channel Model">
            <div className="max-w-7xl mx-auto">
                <FinancialModel />
            </div>
        </DashboardLayout>
    )
}
