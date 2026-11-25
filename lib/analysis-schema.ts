import { z } from 'zod'

export const FIVE_RS = ['Refuse', 'Reduce', 'Reuse', 'Repurpose', 'Recycle'] as const

export const analysisSchema = z.object({
  isWasteItem: z.boolean().describe('False if no recognisable waste item is in the photo'),
  itemName: z.string().describe('Short, specific name of the detected item'),
  classification: z.enum(['biodegradable', 'non-biodegradable']),
  confidence: z.number().int().min(0).max(100),
  primaryR: z.enum(FIVE_RS).describe('The one of the 5 Rs that best applies'),
  rReason: z.string().describe('Why this R applies, 1-2 sentences'),
  decompositionTime: z.string().describe('Estimated breakdown duration, e.g. "2–5 weeks"'),
  disposalTip: z.string().describe('Specific, practical disposal advice'),
})

export type Analysis = z.infer<typeof analysisSchema>

export type Scan = Analysis & {
  id: string
  image: string
  scannedAt: number
}
