import { Fragment } from 'react'
import { cn } from '@/lib/utils'

// Shows a description the way it was typed in the admin: blank lines start a new paragraph and
// single line breaks are kept, so price lists like "$12 / dozen" on their own lines stay readable.
export function DescriptionText({ text, className }: { text: string; className?: string }) {
  const paragraphs = text
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .filter((lines) => lines.length > 0)

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {paragraphs.map((lines, index) => (
        // A one-line paragraph reads as prose; several short lines read as a list, so keep them tighter.
        <p key={index} className={lines.length > 1 ? 'leading-snug' : 'leading-relaxed'}>
          {lines.map((line, lineIndex) => (
            <Fragment key={lineIndex}>
              {lineIndex > 0 ? <br /> : null}
              {/* A short line ending in ":" (e.g. "Gluten-Free:") labels the lines under it. */}
              {line.endsWith(':') && line.length <= 40 ? (
                <span className="font-semibold text-foreground">{line}</span>
              ) : (
                line
              )}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  )
}
