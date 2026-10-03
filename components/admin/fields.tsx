'use client'

import { useId, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { uploadImage } from '@/lib/admin-storage'

const UPLOAD_FAILED_MESSAGE = 'That photo couldn’t be uploaded. JPG or PNG photos work best.'

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor} className="text-base">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export const selectClass =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

export function ImagePicker({ value, alt, onChange }: { value: string; alt: string; onChange: (src: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      onChange((await uploadImage(file)).src)
    } catch (error) {
      console.error('Photo upload failed:', error)
      toast.error(UPLOAD_FAILED_MESSAGE)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
        {value ? <Image src={value} alt={alt || 'Selected image'} fill sizes="96px" className="object-cover" /> : null}
      </div>
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) handleFile(file)
            event.target.value = ''
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="text-base"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload aria-hidden="true" />
          {uploading ? 'Uploading…' : value ? 'Replace photo' : 'Choose photo'}
        </Button>
        <p className="text-sm text-muted-foreground">JPG or PNG from your phone or computer.</p>
      </div>
    </div>
  )
}
