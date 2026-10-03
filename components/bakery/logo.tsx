import Image from 'next/image'
import { cn } from '@/lib/utils'

export function Logo({
  size = 48,
  className,
  priority,
}: {
  size?: number
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src="/images/logo.jpg"
      alt="French Touch Bakery, cakes and pastries"
      width={size}
      height={size}
      priority={priority}
      className={cn('shrink-0 rounded-full', className)}
      style={{ width: size, height: size }}
    />
  )
}
