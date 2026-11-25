const MAX_SIDE = 1024

function drawToDataUrl(source: CanvasImageSource, width: number, height: number) {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.85)
}

export function loadImageAsDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        resolve(drawToDataUrl(img, img.naturalWidth, img.naturalHeight))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => reject(new Error('Could not read image'))
    img.src = src
  })
}

export async function fileToDataUrl(file: File) {
  const url = URL.createObjectURL(file)
  try {
    return await loadImageAsDataUrl(url)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function videoFrameToDataUrl(video: HTMLVideoElement) {
  return drawToDataUrl(video, video.videoWidth, video.videoHeight)
}
