import { Clock, Info, Mail, MapPin, Phone } from 'lucide-react'
import { SectionHeading } from '@/components/bakery/ornaments'
import {
  EMAIL,
  FACEBOOK_URL,
  FacebookIcon,
  INSTAGRAM_URL,
  InstagramIcon,
  PHONE_DISPLAY,
  PHONE_HREF,
} from '@/components/bakery/social'
import { OrderForm } from './order-form'

const CONTACTS = [
  { icon: Phone, label: 'Call or text', value: PHONE_DISPLAY, href: PHONE_HREF },
  { icon: Mail, label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
  { icon: InstagramIcon, label: 'Instagram', value: '@frenchtouch_bakery', href: INSTAGRAM_URL, external: true },
  { icon: FacebookIcon, label: 'Facebook', value: 'French Touch Bakery', href: FACEBOOK_URL, external: true },
]

export function OrderSection() {
  return (
    <section id="order" aria-labelledby="order-page-title" className="py-16 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:px-6">
        <SectionHeading
          id="order-page-title"
          eyebrow="Place an order"
          title="Votre Commande"
          intro="Check your picks, choose a pickup date and send it over. Agathe will reply within a day or two to confirm."
        />

        <div className="grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
          <OrderForm />

          <aside aria-labelledby="order-aside-title" className="flex flex-col gap-4 lg:sticky lg:top-28">
            <h3 id="order-aside-title" className="sr-only">
              Good to know
            </h3>
            <div className="flex flex-col gap-4 rounded-3xl bg-sage/30 p-6">
              <p className="flex items-start gap-3 leading-relaxed">
                <Clock className="mt-1 size-5 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="font-semibold">Please allow 48–72 hours notice</strong> for most orders. Larger
                  celebration cakes may need a little more.
                </span>
              </p>
              <p className="flex items-start gap-3 leading-relaxed">
                <Info className="mt-1 size-5 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="font-semibold">Allergen information is available on request.</strong> Everything
                  is made in a home kitchen that uses nuts, dairy, eggs and wheat.
                </span>
              </p>
              <p className="flex items-start gap-3 leading-relaxed">
                <MapPin className="mt-1 size-5 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="font-semibold">Pickup by appointment</strong> in Meridian, ID 83646.
                </span>
              </p>
            </div>

            <p className="pt-2 text-lg font-semibold">Prefer to call, text or message?</p>
            <address className="flex flex-col gap-3 not-italic">
              {CONTACTS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-blush/40"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blush/60">
                    <item.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="truncate text-lg font-semibold">{item.value}</span>
                  </span>
                </a>
              ))}
            </address>
          </aside>
        </div>
      </div>
    </section>
  )
}
