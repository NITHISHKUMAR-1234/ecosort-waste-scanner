import { generateText, Output } from 'ai'
import { z } from 'zod'
import { analysisSchema } from '@/lib/analysis-schema'

export const maxDuration = 60

const requestSchema = z.object({
  image: z
    .string()
    .regex(/^data:image\/(png|jpe?g|webp|gif|heic|heif);base64,/i, 'Invalid image')
    .max(8_000_000, 'Image too large'),
})

const SYSTEM_PROMPT = `You are EcoSort, an expert waste-classification assistant.
Look carefully at the photo and identify the main waste item shown (e.g. a leaf, apple core, plastic bag, glass jar, battery, coffee cup, clothing, electronics).
Classify it as "biodegradable" (breaks down naturally through microbes: food, plants, paper, untreated wood, natural fibres) or "non-biodegradable" (plastics, metals, glass, synthetic fibres, electronics, batteries).
Then choose which of the 5 Rs (Refuse, Reduce, Reuse, Repurpose, Recycle) best applies and explain why in one or two sentences.
Give a realistic decomposition time range in natural conditions (e.g. "2–5 weeks", "450+ years").
Give one specific, practical disposal tip (which bin, how to prepare it, or hazardous-waste drop-off when relevant).
If the photo contains no recognisable waste item, set isWasteItem to false and explain briefly in itemName.
Confidence is an integer 0–100 reflecting how sure you are about the item identity and classification.`

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Please provide a valid image (PNG, JPG or WEBP).' }, { status: 400 })
  }

  const [, mediaType, base64] = parsed.data.image.match(/^data:(image\/[a-z+]+);base64,(.*)$/is) ?? []
  if (!mediaType || !base64) {
    return Response.json({ error: 'Please provide a valid image (PNG, JPG or WEBP).' }, { status: 400 })
  }

  try {
    const { output } = await generateText({
      model: 'google/gemini-3.5-flash',
      system: SYSTEM_PROMPT,
      output: Output.object({ schema: analysisSchema }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyse this waste item.' },
            { type: 'image', image: base64, mediaType: mediaType.toLowerCase() },
          ],
        },
      ],
    })
    return Response.json(output)
  } catch (error) {
    console.error('[ecosort] analysis failed', error)
    const message = error instanceof Error ? error.message : ''
    if (/credit card/i.test(message)) {
      return Response.json(
        { error: 'Vision AI is not activated yet: add a credit card to your Vercel team (AI Gateway settings) to unlock free AI credits, then try again.' },
        { status: 503 },
      )
    }
    return Response.json({ error: 'The Vision AI could not analyse this image. Please try again.' }, { status: 502 })
  }
}
