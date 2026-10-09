import { Mail, Phone, MessageCircle } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import { usePlatformSettings } from '../../hooks/usePlatformSettings'

export default function Support() {
  const { supportEmail, supportPhone, platformName } = usePlatformSettings()
  const CHANNELS = [
    { icon: Mail, label: 'Email Support', value: supportEmail },
    { icon: Phone, label: 'Call Us', value: supportPhone },
    { icon: MessageCircle, label: 'Support Hours', value: 'Monday – Friday, 8:00 AM – 5:00 PM (WAT)' },
  ]

  return (
    <div className="max-w-2xl">
      <PageHeader title="Support" subtitle={`Need help? Reach out to the ${platformName} support team.`} />
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
