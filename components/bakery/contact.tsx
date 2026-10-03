import { Mail, MapPin, Phone } from 'lucide-react'
import { ContactForm } from './contact-form'
import { SectionHeading } from './ornaments'
import {
  EMAIL,
  FACEBOOK_URL,
  FacebookIcon,
  INSTAGRAM_URL,
  InstagramIcon,
  PHONE_DISPLAY,
  PHONE_HREF,
} from './social'

const CONTACTS = [
  { icon: Phone, label: 'Call or text', value: PHONE_DISPLAY, href: PHONE_HREF },
  { icon: Mail, label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
  { icon: InstagramIcon, label: 'Instagram', value: '@frenchtouch_bakery', href: INSTAGRAM_URL, external: true },
  { icon: FacebookIcon, label: 'Facebook', value: 'French Touch Bakery', href: FACEBOOK_URL, external: true },
]

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="py-20 md:py-28">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:px-6">
        <SectionHeading
          id="contact-title"
          eyebrow="Place an order"
          title="Say Bonjour"
          intro="Tell me what you're celebrating and I'll help you choose the perfect treats."
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <address className="flex flex-col gap-4 not-italic">
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
            <p className="flex items-center gap-4 rounded-2xl bg-sage/30 p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card">
                <MapPin className="size-5" aria-hidden="true" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm text-muted-foreground">Pickup by appointment</span>
                <span className="text-lg font-semibold">Meridian, ID 83646</span>
              </span>
            </p>
          </address>

          <ContactForm />
        </div>
      </div>
    </section>
  )
}
