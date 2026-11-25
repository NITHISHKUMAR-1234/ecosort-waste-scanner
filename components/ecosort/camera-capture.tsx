'use client'

import { useEffect, useRef, useState } from 'react'
import { Aperture, SwitchCamera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { videoFrameToDataUrl } from '@/lib/image'

type Props = {
  onCapture: (dataUrl: string) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [facing, setFacing] = useState<'environment' | 'user'>('environment')
  const [status, setStatus] = useState<'starting' | 'ready' | 'denied'>('starting')

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: facing }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        stream = s
        if (videoRef.current) videoRef.current.srcObject = s
        setStatus('ready')
      })
      .catch(() => !cancelled && setStatus('denied'))
    if (!navigator.mediaDevices) setStatus('denied')
    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [facing])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-foreground">
        <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover" aria-label="Camera preview" />
        {status !== 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-background">
            {status === 'starting'
              ? 'Waiting for camera permission...'
              : 'Camera access was blocked or is unavailable. Allow camera access in your browser settings, or upload a photo instead.'}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={onClose}>
          <X aria-hidden="true" />
          Cancel
        </Button>
        <Button
          size="lg"
          disabled={status !== 'ready'}
          onClick={() => videoRef.current && onCapture(videoFrameToDataUrl(videoRef.current))}
        >
          <Aperture aria-hidden="true" />
          Snap photo
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setStatus('starting')
            setFacing((f) => (f === 'environment' ? 'user' : 'environment'))
          }}
          aria-label="Switch camera"
        >
          <SwitchCamera aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
