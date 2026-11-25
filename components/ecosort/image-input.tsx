'use client'

import { useRef, useState, type DragEvent } from 'react'
import Image from 'next/image'
import { Camera, ImageUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { fileToDataUrl, loadImageAsDataUrl } from '@/lib/image'
import { CameraCapture } from './camera-capture'

const SAMPLES = [
  { label: 'Banana Peel', src: '/samples/banana-peel.png' },
  { label: 'Plastic Water Bottle', src: '/samples/plastic-bottle.png' },
  { label: 'Cardboard Box', src: '/samples/cardboard-box.png' },
]

type Props = {
  disabled: boolean
  onImage: (dataUrl: string) => void
}

export function ImageInput({ disabled, onImage }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFileError('Please choose an image file.')
      return
    }
    setFileError(null)
    try {
      onImage(await fileToDataUrl(file))
    } catch {
      setFileError('Could not read that image. Try a JPG or PNG.')
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    if (!disabled) handleFile(e.dataTransfer.files[0])
  }

  return (
    <section aria-labelledby="input-heading" className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
      <h2 id="input-heading" className="sr-only">
        Choose an image
      </h2>

      {cameraOpen ? (
        <CameraCapture
          onCapture={(img) => {
            setCameraOpen(false)
            onImage(img)
          }}
          onClose={() => setCameraOpen(false)}
        />
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors',
            dragging ? 'border-primary bg-accent' : 'border-input bg-muted/50',
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <ImageUp className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium">Drag and drop a photo here</p>
            <p className="text-sm text-muted-foreground">JPG, PNG or WEBP</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button disabled={disabled} onClick={() => fileRef.current?.click()}>
              <ImageUp aria-hidden="true" />
              Upload image
            </Button>
            <Button variant="outline" disabled={disabled} onClick={() => setCameraOpen(true)}>
              <Camera aria-hidden="true" />
              Use Camera
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              handleFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>
      )}

      {fileError && (
        <p role="alert" className="text-sm text-nonbio">
          {fileError}
        </p>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Try a sample item</p>
        <div className="grid grid-cols-3 gap-2">
          {SAMPLES.map((s) => (
            <button
              key={s.label}
              type="button"
              disabled={disabled}
              onClick={async () => onImage(await loadImageAsDataUrl(s.src))}
              className="group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <span className="relative aspect-square w-full bg-muted">
                <Image src={s.src} alt="" fill sizes="(min-width: 1024px) 160px, 33vw" className="object-cover transition group-hover:scale-105" />
              </span>
              <span className="px-2 py-2 text-xs font-medium leading-tight sm:text-sm">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
