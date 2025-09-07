import { Metadata } from 'next'
import { TrainerLayoutClient } from '@/components/trainer/layout-client'

export const metadata: Metadata = {
  title: 'Trainer Dashboard | FitnessPr',
  description: 'Manage your clients, programs, and business with FitnessPr trainer dashboard',
}

interface TrainerLayoutProps {
  children: React.ReactNode
}

export default function TrainerLayout({ children }: TrainerLayoutProps) {
  return <TrainerLayoutClient>{children}</TrainerLayoutClient>
}
