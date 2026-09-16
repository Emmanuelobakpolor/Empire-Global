import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Landmark,
  ShieldCheck,
  Eye,
  BellRing,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  UserPlus,
  Layers,
  Wallet,
  LineChart,
  Star,
  Sparkles,
  Lock,
  Clock,
  Smartphone,
} from 'lucide-react'
import { useState } from 'react'
import Logo from '../../components/Logo'
import Button from '../../components/ui/Button'
import Reveal from '../../components/Reveal'
import HeroSlider from '../../components/HeroSlider'
import FaqAccordion from '../../components/FaqAccordion'
import AnimatedCounter from '../../components/AnimatedCounter'
import SmartImage from '../../components/SmartImage'
import { PRODUCT_ICONS, PRODUCT_COLORS } from '../../components/customer/ProductCard'
import { initialProducts } from '../../data/products'
import { PRODUCT_IMAGES, SECTION_IMAGES, AVATARS } from '../../data/images'

const NAV_LINKS = [
  { href: '#products', label: 'Products' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#why-us', label: 'Why Choose Us' },
  { href: '#faq', label: 'FAQ' },
  { href: '#footer', label: 'Contact' },
]

const PRODUCT_SUMMARIES = [
  {
    type: 'savings',
    title: 'Savings',
    tagline: 'From ₦5,000',
    description: 'Save towards your financial goals with flexible or fixed savings plans.',
  },
  {
    type: 'investment',
    title: 'Investment',
    tagline: 'Stable returns',
    description: 'Grow your money with available investment plans and stable returns.',
  },
  {
    type: 'thrift',
    title: 'Thrift',
    tagline: 'Weekly & monthly',
    description: 'Build consistent savings discipline through structured thrift plans.',
  },
  {
    type: 'loan',
    title: 'Loans',
    tagline: 'Fast approval',
    description: 'Access flexible loan products designed for personal or business needs.',
  },
  {
    type: 'hire-purchase',
    title: 'Hire Purchase',
    tagline: 'Spread payments',
    description: 'Acquire the products you need today and pay gradually over time.',
  },
]

const BENEFITS = [
  { icon: ShieldCheck, title: 'Secure', description: 'Your account activity is protected with verification checkpoints at every step.' },
  { icon: Eye, title: 'Transparent', description: 'Clear payment instructions and visible transaction timelines, always.' },
  { icon: TrendingUp, title: 'Easy Tracking', description: 'Track every transaction from creation to approval in real time.' },
  { icon: CheckCircle2, title: 'Verified Payments', description: 'Every payment is reviewed and verified before it reflects on your account.' },
  { icon: BellRing, title: 'Stay Informed', description: 'Get notified instantly the moment your payment status changes.' },
  { icon: Landmark, title: 'Financial Management', description: 'Manage savings, investments, loans and hire-purchase in one dashboard.' },
]

const STEPS = [
  { icon: UserPlus, title: 'Create Your Account', description: 'Sign up in minutes with just your name, email and phone number.' },
  { icon: Layers, title: 'Choose a Plan', description: 'Pick from savings, investment, thrift, loan or hire-purchase products.' },
  { icon: Wallet, title: 'Fund Your Plan', description: 'Make a transfer and upload your receipt for quick verification.' },
  { icon: LineChart, title: 'Track & Grow', description: 'Watch your transactions and balances update in real time.' },
]

const STATS = [
  { value: 12500, suffix: '+', label: 'Active Customers' },
  { value: 5, prefix: '₦', suffix: 'B+', label: 'Transacted Securely' },
  { value: 98, suffix: '%', label: 'Payment Verification Rate' },
  { value: 4.8, suffix: '/5', label: 'Average Customer Rating', decimal: true },
]

const TRUST_MARKERS = [
  'Verification at every step',
  'Real-time transaction timeline',
  'Receipt-backed approvals',
  'Instant status notifications',
  'One dashboard for every plan',
]

const ASSURANCES = [
  {
    icon: Lock,
    title: 'Verified before it counts',
    description: 'No payment reflects on your account until a reviewer has matched it against your receipt.',
  },
  {
    icon: Clock,
    title: 'Reviewed in hours, not days',
    description: 'Most receipts are cleared the same working day, and you can watch the status change live.',
  },
  {
    icon: Smartphone,
    title: 'Built for your phone',
    description: 'Every screen — from starting a plan to uploading a receipt — is designed mobile-first.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Ngozi Adeyemi',
    role: 'Small Business Owner, Lagos',
    avatar: AVATARS.ngozi,
    quote: 'Empire Global made it so easy to track my thrift contributions. The transaction history is always clear and payments get verified fast.',
    rating: 5,
  },
  {
    name: 'Emeka Chukwu',
    role: 'Investment Customer',
    avatar: AVATARS.emeka,
    quote: 'I locked in a 12-month investment plan and the dashboard makes it simple to see exactly where my money stands at every point.',
    rating: 5,
  },
  {
    name: 'Aisha Bello',
    role: 'Hire-Purchase Customer',
    avatar: AVATARS.aisha,
    quote: 'Got my new laptop through the hire-purchase plan and the payment schedule was transparent from day one. No surprises.',
    rating: 4,
  },
]

const FAQS = [
  {
    question: 'Is my money safe with Empire Global?',
    answer: 'Every transaction goes through a verification checkpoint before it reflects on your account, and your dashboard gives you full visibility into every step — from payment to approval.',
  },
  {
    question: 'How long does payment verification take?',
    answer: 'Most receipts are reviewed within a few hours. You can track the exact status of your payment — Pending, Under Review, or Approved — from your Transaction Details page at any time.',
  },
  {
    question: 'Can I withdraw from my savings plan early?',
    answer: 'Flexible plans like Flexi Save allow withdrawals anytime. Fixed-term plans are designed to be held for their full duration to earn the advertised return.',
  },
  {
    question: 'What documents do I need to get started?',
    answer: 'Just your full name, email address and phone number to create an account. No paperwork is required to explore products or start a plan.',
  },
  {
    question: 'How do I contact support if I have an issue?',
    answer: 'You can reach our support team directly via WhatsApp using the chat button in the corner of the screen, or through the Support page in your dashboard.',
  },
]

/* Small labelled heading that sits above each section title */
function SectionEyebrow({ children, tone = 'light' }) {
  const styles =
    tone === 'dark'
      ? 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20'
      : 'text-emerald-700 bg-emerald-50 border-emerald-100'
  return (
    <span className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] border rounded-full px-3.5 py-1.5 ${styles}`}>
      <Sparkles size={12} />
      {children}
    </span>
  )
}

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ===================== Nav ===================== */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-navy-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Logo size="sm" />
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-navy-500">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 rounded-lg hover:text-navy-900 hover:bg-navy-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-semibold text-navy-700 px-4 py-2.5 rounded-xl hover:bg-navy-50 hover:text-navy-900 transition-colors"
            >
              Login
            </Link>
            <Link to="/register">
              <Button variant="accent">Get Started</Button>
            </Link>
          </div>
          <button
            className="md:hidden text-navy-700 p-2 -mr-2 rounded-lg hover:bg-navy-50"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-navy-100 px-4 py-4 flex flex-col gap-1 animate-fade-in bg-white">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-navy-600 px-3 py-2.5 rounded-lg hover:bg-navy-50"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-navy-100 my-2" />
            <Link to="/login" className="text-sm font-semibold text-navy-700 px-3 py-2.5">
              Login
            </Link>
            <Link to="/register" onClick={() => setMobileOpen(false)}>
              <Button variant="accent" fullWidth>Get Started</Button>
            </Link>
          </div>
        )}
      </header>

      {/* ===================== Hero ===================== */}
      <section className="relative overflow-hidden bg-navy-900">
        {/* Ambient colour orbs */}
        <div className="absolute -top-40 -left-32 w-[34rem] h-[34rem] rounded-full bg-emerald-500/20 blur-3xl animate-drift" />
        <div className="absolute -bottom-52 -right-20 w-[36rem] h-[36rem] rounded-full bg-emerald-400/10 blur-3xl animate-drift-delayed" />
        <div className="absolute inset-0 bg-dot-grid mask-fade-edges" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-7 animate-fade-in">
              <ShieldCheck size={14} /> Trusted financial management
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.08] text-white">
              Build Your <span className="text-gradient-emerald">Financial Future</span>
            </h1>

            <p className="text-navy-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mt-6">
              Empire Global provides financial products for savings, investments, thrift, loans and
              hire purchase — all managed from one secure dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mt-9">
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="accent" size="lg" fullWidth icon={ArrowRight} iconPosition="right">
                  Get Started
                </Button>
              </Link>
              <a href="#products" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="!bg-white/5 !text-white !border-white/20 hover:!bg-white/10 backdrop-blur"
                >
                  Explore Products
                </Button>
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mt-10">
              <div className="flex -space-x-3">
                {TESTIMONIALS.map((t) => (
                  <img
                    key={t.name}
                    src={t.avatar}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-navy-900"
                  />
                ))}
                <span className="w-10 h-10 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-navy-900">
                  12k+
                </span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-navy-400 text-xs mt-1">Rated 4.8/5 by our customers</p>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="relative h-80 sm:h-[26rem] lg:h-[30rem] animate-float-slow">
              <HeroSlider />
            </div>

            {/* Floating verification card */}
            <div className="hidden sm:flex absolute -bottom-6 -left-4 lg:-left-10 z-20 items-center gap-3 glass-panel rounded-2xl px-4 py-3.5 shadow-2xl">
              <span className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </span>
              <div>
                <p className="text-white text-sm font-bold leading-tight">Payment Verified</p>
                <p className="text-navy-300 text-xs mt-0.5">₦250,000 · Fixed Savings</p>
              </div>
            </div>

            {/* Floating portfolio card */}
            <div className="hidden lg:block absolute -top-5 -right-5 z-20 glass-panel rounded-2xl px-4 py-3.5 shadow-2xl">
              <p className="text-navy-300 text-[11px] font-semibold uppercase tracking-wider">Portfolio</p>
              <p className="text-white text-lg font-extrabold mt-0.5">+18.4%</p>
              <div className="flex items-end gap-1 mt-2 h-8">
                {[35, 52, 44, 68, 58, 85, 100].map((h, i) => (
                  <span key={i} className="w-1.5 rounded-full bg-emerald-400/80" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trust marquee */}
        <div className="relative border-t border-white/10 py-5 marquee-mask">
          <div className="flex w-max animate-marquee">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center shrink-0" aria-hidden={dup === 1}>
                {TRUST_MARKERS.map((marker) => (
                  <span
                    key={marker}
                    className="flex items-center gap-2.5 px-7 text-sm font-semibold text-navy-400 whitespace-nowrap"
                  >
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    {marker}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== Stats bar ===================== */}
      <section className="bg-navy-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, idx) => (
            <Reveal key={stat.label} delay={(idx % 4) + 1} className="text-center lg:text-left">
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {stat.decimal ? (
                  <>
                    {stat.prefix || ''}
                    {stat.value}
                    {stat.suffix}
                  </>
                ) : (
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                )}
              </p>
              <p className="text-xs sm:text-sm text-navy-400 mt-2">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===================== Products ===================== */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <SectionEyebrow>Our Products</SectionEyebrow>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-5">
            Financial products for every goal
          </h2>
          <p className="text-navy-400 mt-4 text-base leading-relaxed">
            Tailored plans to help you save, invest, and grow — whatever stage you're at.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCT_SUMMARIES.map((p, idx) => {
            const Icon = PRODUCT_ICONS[p.type]
            const product = initialProducts.find((prod) => prod.type === p.type)
            return (
              <Reveal key={p.type} delay={(idx % 4) + 1}>
                <Link
                  to={product ? `/customer/products/${product.id}` : '/register'}
                  className="img-zoom-wrap group flex flex-col h-full bg-white rounded-3xl border border-navy-100 shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-emerald-200"
                >
                  {/* Photo header */}
                  <div className="relative h-44 overflow-hidden">
                    <SmartImage
                      src={PRODUCT_IMAGES[p.type]}
                      alt={p.title}
                      className="absolute inset-0"
                      imgClassName="w-full h-full object-cover img-zoom"
                      placeholderClass="bg-navy-100"
                    />
                    {/* Scrim keeps the white overlay text legible on light photos too */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/45 to-navy-950/20" />
                    <span className="absolute top-4 right-4 text-[11px] font-bold text-white bg-navy-950/50 backdrop-blur-md border border-white/25 rounded-full px-3 py-1.5">
                      {p.tagline}
                    </span>
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${PRODUCT_COLORS[p.type]}`}>
                        <Icon size={20} />
                      </span>
                      <h3 className="font-bold text-white text-lg tracking-tight text-shadow-photo">{p.title}</h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-sm text-navy-400 leading-relaxed flex-1">{p.description}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 mt-5 group-hover:gap-2.5 transition-all">
                      View Details <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )
          })}

          {/* CTA tile fills the sixth grid cell */}
          <Reveal delay={2}>
            <div className="relative h-full min-h-[20rem] rounded-3xl overflow-hidden bg-navy-900 flex flex-col justify-end p-7">
              <div className="absolute inset-0 bg-dot-grid opacity-60" />
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/25 blur-3xl" />
              <div className="relative">
                <span className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-5">
                  <Sparkles size={22} />
                </span>
                <h3 className="text-xl font-extrabold text-white tracking-tight">Not sure which plan fits?</h3>
                <p className="text-navy-300 text-sm mt-2.5 leading-relaxed">
                  Create a free account and browse every product side by side before you commit a naira.
                </p>
                <Link to="/register" className="inline-block mt-6">
                  <Button variant="accent" icon={ArrowRight} iconPosition="right">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== About / trust split ===================== */}
      <section className="bg-slate-50 py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-line-grid opacity-70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Image collage */}
          <Reveal className="relative">
            <div className="relative grid grid-cols-5 grid-rows-6 gap-4 h-[26rem] sm:h-[32rem]">
              <SmartImage
                src={SECTION_IMAGES.aboutPrimary}
                alt="A customer reviewing their finances"
                className="col-span-3 row-span-6 rounded-3xl shadow-2xl"
                imgClassName="w-full h-full object-cover"
                placeholderClass="bg-navy-100"
              />
              <SmartImage
                src={SECTION_IMAGES.aboutSecondary}
                alt="Planning session at Empire Global"
                className="col-span-2 row-span-3 rounded-3xl shadow-xl"
                imgClassName="w-full h-full object-cover"
                placeholderClass="bg-navy-100"
              />
              <SmartImage
                src={SECTION_IMAGES.aboutTertiary}
                alt="Reviewing a savings plan on a phone"
                className="col-span-2 row-span-3 rounded-3xl shadow-xl"
                imgClassName="w-full h-full object-cover"
                placeholderClass="bg-navy-100"
              />
            </div>

            {/* Floating stat badge */}
            <div className="absolute -bottom-6 left-6 sm:left-10 bg-white rounded-2xl shadow-2xl border border-navy-100 px-5 py-4 flex items-center gap-4">
              <span className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp size={22} />
              </span>
              <div>
                <p className="text-xl font-extrabold text-navy-900 leading-none">98%</p>
                <p className="text-xs text-navy-400 mt-1">Verification rate</p>
              </div>
            </div>
          </Reveal>

          {/* Copy */}
          <Reveal delay={1}>
            <SectionEyebrow>Why Empire Global</SectionEyebrow>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-5 leading-tight">
              Money management that shows its working
            </h2>
            <p className="text-navy-400 mt-5 leading-relaxed">
              We built Empire Global around a simple idea: you should never have to wonder where your
              money is. Every payment carries a receipt, every receipt gets reviewed, and every status
              change reaches you the moment it happens.
            </p>

            <div className="flex flex-col gap-5 mt-9">
              {ASSURANCES.map((a) => (
                <div key={a.title} className="flex items-start gap-4">
                  <span className="w-11 h-11 rounded-xl bg-white border border-navy-100 shadow-soft text-emerald-600 flex items-center justify-center shrink-0">
                    <a.icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-bold text-navy-900">{a.title}</h3>
                    <p className="text-sm text-navy-400 mt-1 leading-relaxed">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/register" className="inline-block mt-9">
              <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                Open Your Account
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===================== How it works ===================== */}
      <section id="how-it-works" className="py-20 sm:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <SectionEyebrow>Getting Started</SectionEyebrow>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-5">
              How It Works
            </h2>
            <p className="text-navy-400 mt-4 leading-relaxed">
              Four simple steps between you and your financial goals.
            </p>
          </Reveal>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="hidden lg:block absolute top-9 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
            {STEPS.map((step, idx) => (
              <Reveal key={step.title} delay={idx + 1} className="relative text-center">
                <div className="relative z-10 w-[4.5rem] h-[4.5rem] rounded-2xl bg-navy-900 text-emerald-400 flex items-center justify-center mx-auto shadow-xl ring-8 ring-white">
                  <step.icon size={28} />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center ring-4 ring-white">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="font-bold text-navy-900 mt-6 text-lg tracking-tight">{step.title}</h3>
                <p className="text-sm text-navy-400 mt-2.5 max-w-xs mx-auto leading-relaxed">
                  {step.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== Security banner ===================== */}
      <section className="relative overflow-hidden">
        <SmartImage
          fill
          src={SECTION_IMAGES.security}
          alt=""
          placeholderClass="bg-navy-900"
        />
        <div className="absolute inset-0 bg-navy-950/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-transparent to-navy-950" />
        <div className="absolute inset-0 bg-dot-grid opacity-50" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
          <Reveal>
            <span className="inline-flex w-16 h-16 rounded-2xl bg-emerald-500 text-white items-center justify-center mb-7 animate-pulse-ring">
              <ShieldCheck size={30} />
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Every naira accounted for
            </h2>
            <p className="text-navy-300 mt-5 max-w-2xl mx-auto leading-relaxed">
              Payments move through a documented review before they touch your balance. You see the
              reference, the receipt and the reviewer's decision — the same record we do.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-12 text-left">
              {[
                { label: 'Unique reference', value: 'Per transaction' },
                { label: 'Receipt review', value: 'Human verified' },
                { label: 'Status updates', value: 'Real time' },
              ].map((item) => (
                <div key={item.label} className="glass-panel rounded-2xl px-5 py-5">
                  <p className="text-white font-bold text-lg tracking-tight">{item.value}</p>
                  <p className="text-navy-300 text-xs mt-1.5 uppercase tracking-wider font-semibold">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== Why choose us ===================== */}
      <section id="why-us" className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <SectionEyebrow>The Difference</SectionEyebrow>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-5">
              Why Choose Empire Global
            </h2>
            <p className="text-navy-400 mt-4 leading-relaxed">
              Built to make managing your money simple, transparent, and secure.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b, idx) => (
              <Reveal key={b.title} delay={(idx % 4) + 1}>
                <div className="group bg-white rounded-2xl border border-navy-100 p-7 h-full transition-all duration-300 hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1">
                  <span className="w-12 h-12 rounded-2xl bg-navy-900 text-emerald-400 flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-emerald-500 group-hover:text-white">
                    <b.icon size={22} />
                  </span>
                  <h3 className="font-bold text-navy-900 mt-5 text-lg tracking-tight">{b.title}</h3>
                  <p className="text-sm text-navy-400 mt-2 leading-relaxed">{b.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== Testimonials ===================== */}
      <section className="bg-navy-900 py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute -bottom-40 -left-32 w-[32rem] h-[32rem] rounded-full bg-emerald-500/15 blur-3xl animate-drift" />
        <div className="absolute inset-0 bg-dot-grid mask-fade-edges" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <SectionEyebrow tone="dark">Testimonials</SectionEyebrow>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-5">
              What Our Customers Say
            </h2>
            <p className="text-navy-300 mt-4 leading-relaxed">
              Real experiences from people managing their money with Empire Global.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <Reveal key={t.name} delay={idx + 1}>
                <figure className="glass-panel rounded-3xl p-7 h-full flex flex-col transition-all duration-300 hover:bg-white/[0.12] hover:-translate-y-1">
                  <div className="flex items-center gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-navy-600'}
                      />
                    ))}
                  </div>

                  <blockquote className="text-navy-100 text-[15px] leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  <figcaption className="flex items-center gap-3.5 mt-6 pt-6 border-t border-white/10">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      loading="lazy"
                      decoding="async"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-400/40 shrink-0"
                    />
                    <div>
                      <p className="text-white text-sm font-bold">{t.name}</p>
                      <p className="text-navy-400 text-xs mt-0.5">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section id="faq" className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-14">
            <SectionEyebrow>Questions</SectionEyebrow>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight mt-5">
              Frequently Asked Questions
            </h2>
            <p className="text-navy-400 mt-4 leading-relaxed">
              Everything you need to know before you get started.
            </p>
          </Reveal>
          <Reveal>
            <FaqAccordion items={FAQS} />
          </Reveal>
        </div>
      </section>

      {/* ===================== Final CTA ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28">
        <Reveal className="relative rounded-[2rem] overflow-hidden bg-navy-950">
          <SmartImage
            fill
            src={SECTION_IMAGES.cta}
            alt=""
            placeholderClass="bg-navy-900"
          />
          {/* Copy sits on the left, so the scrim is heaviest there and clears to the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/25" />
          <div className="absolute -top-20 -right-10 w-96 h-96 rounded-full bg-emerald-500/25 blur-3xl" />

          <div className="relative px-6 sm:px-14 py-16 sm:py-20 max-w-2xl">
            <SectionEyebrow tone="dark">Get Started Today</SectionEyebrow>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-5 leading-tight">
              Ready to build your financial future?
            </h2>
            <p className="text-navy-300 mt-5 leading-relaxed">
              Create your free account in minutes and start saving, investing or applying for a plan
              today. No paperwork, no waiting.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-9">
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="accent" size="lg" fullWidth icon={ArrowRight} iconPosition="right">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="!bg-white/5 !text-white !border-white/20 hover:!bg-white/10 backdrop-blur"
                >
                  I Already Have an Account
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===================== Footer ===================== */}
      <footer id="footer" className="bg-navy-950 text-navy-300 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Logo variant="light" size="sm" />
            <p className="text-sm text-navy-400 mt-5 max-w-xs leading-relaxed">
              Empire Global is a financial services platform for savings, investments, thrift, loans
              and hire purchase.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Register</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Products</h4>
            <ul className="space-y-2.5 text-sm">
              {PRODUCT_SUMMARIES.map((p) => (
                <li key={p.type} className="text-navy-400">{p.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-navy-400">
              <li>support@empireglobal.com</li>
              <li>+234 700 000 0000</li>
              <li>Victoria Island, Lagos, Nigeria</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-navy-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-navy-500">
            <p>© {new Date().getFullYear()} Empire Global. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <span className="hover:text-navy-300 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-navy-300 cursor-pointer transition-colors">Terms &amp; Conditions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
