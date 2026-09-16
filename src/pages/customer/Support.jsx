import { Mail, Phone, MessageCircle } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'

const CHANNELS = [
  { icon: Mail, label: 'Email Support', value: 'support@empireglobal.com' },
  { icon: Phone, label: 'Call Us', value: '+234 700 000 0000' },
  { icon: MessageCircle, label: 'Live Chat', value: 'Available 8am - 6pm, Mon - Sat' },
]

export default function Support() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="Support" subtitle="Need help? Reach out to the Empire Global support team." />
      <div className="flex flex-col gap-4">
        {CHANNELS.map((c) => (
          <Card key={c.label} className="flex items-center gap-4">
            <span className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <c.icon size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-navy-900">{c.label}</p>
              <p className="text-sm text-navy-500">{c.value}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
