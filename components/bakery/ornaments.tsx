import Image from 'next/image'
import { cn } from '@/lib/utils'

export function BotanicalDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('flex justify-center', className)}>
      <Image
        src="/images/sprig.png"
        alt=""
        width={1584}
        height={680}
        className="h-auto w-56 mix-blend-multiply sprig-mask md:w-72"
      />
    </div>
  )
}

export function WatercolorWash({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute wash-mask', className)}
    >
      <Image
        src="/images/wash-blush.png"
        alt=""
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover mix-blend-multiply opacity-70"
      />
    </div>
  )
}

export function TricolorRule({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('flex h-1 w-12 overflow-hidden rounded-full', className)}>
      <span className="flex-1 bg-bleu" />
      <span className="flex-1 bg-card" />
      <span className="flex-1 bg-rouge" />
    </div>
  )
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
}: {
  id: string
  eyebrow: string
  title: string
  intro?: string
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 id={id} className="font-script text-5xl leading-tight text-foreground md:text-6xl text-balance">
        {title}
      </h2>
      <TricolorRule />
      {intro ? (
        <p className="text-lg leading-relaxed text-muted-foreground text-pretty">{intro}</p>
      ) : null}
    </div>
  )
}
