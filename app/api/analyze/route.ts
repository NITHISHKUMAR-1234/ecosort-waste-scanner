import { z } from 'zod'
import { analysisSchema, FIVE_RS } from '@/lib/analysis-schema'

export const maxDuration = 60

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest']
const RETRYABLE_STATUSES = new Set([404, 429, 500, 502, 503, 504])

const requestSchema = z.object({
  image: z
    .string()
    .regex(/^data:image\/(png|jpe?g|webp|heic|heif);base64,/i, 'Invalid image')
    .max(8_000_000, 'Image too large'),
})

const SYSTEM_PROMPT = `You are EcoSort, an expert waste-classification assistant.
Look carefully at the photo and identify the actual main waste item shown (e.g. a dry leaf, apple core, plastic bag, glass jar, AA battery, coffee cup, old T-shirt, phone charger).
Classify it as exactly one of:
- "biodegradable": breaks down naturally through microbes (food scraps, plants, leaves, paper, untreated wood, natural fibres).
- "non-biodegradable": persists for decades or centuries but is safe for normal bins/recycling (most plastics, metals, glass, synthetic fibres).
- "special-handling": hazardous or regulated items that must NOT go in normal bins (batteries, electronics/e-waste, light bulbs, medicines, paint, chemicals, aerosols, sharps).
Then choose which of the 5 Rs (Refuse, Reduce, Reuse, Repurpose, Recycle) best applies and explain why in one or two sentences.
Give a realistic decomposition time range in natural conditions (e.g. "2–5 weeks", "450+ years").
Give one specific, practical disposal recommendation (which bin, how to prepare it, or the right drop-off point for special items).
If the photo contains no recognisable waste item, set isWasteItem to false and briefly describe what you see in itemName.
confidence is an integer 0–100 reflecting how sure you are about the item identity and classification.`

const responseSchema = {
  type: 'OBJECT',
  properties: {
    isWasteItem: { type: 'BOOLEAN' },
    itemName: { type: 'STRING' },
    classification: { type: 'STRING', enum: ['biodegradable', 'non-biodegradable', 'special-handling'] },
    confidence: { type: 'INTEGER' },
    primaryR: { type: 'STRING', enum: [...FIVE_RS] },
    rReason: { type: 'STRING' },
    decompositionTime: { type: 'STRING' },
    disposalTip: { type: 'STRING' },
  },
  required: ['isWasteItem', 'itemName', 'classification', 'confidence', 'primaryR', 'rReason', 'decompositionTime', 'disposalTip'],
  propertyOrdering: ['isWasteItem', 'itemName', 'classification', 'confidence', 'primaryR', 'rReason', 'decompositionTime', 'disposalTip'],
}

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[]
  promptFeedback?: { blockReason?: string }
  error?: { code?: number; message?: string; status?: string }
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

function describeGeminiError(status: number, data: GeminiResponse | null, model: string) {
  const detail = data?.error?.message ?? ''
  if (status === 400 && /api key/i.test(detail)) return 'Your GEMINI_API_KEY is invalid. Create a new key in Google AI Studio and update the environment variable.'
  if (status === 400) return `Gemini rejected the request: ${detail || 'bad request'}`
  if (status === 401 || status === 403) return 'Your GEMINI_API_KEY does not have permission to use the Gemini API. Check the key in Google AI Studio.'
  if (status === 404) return `The Gemini model "${model}" is not available for your API key. Set GEMINI_MODEL to a current vision model (e.g. ${FALLBACK_MODELS[0]}).`
  if (status === 429) return 'Gemini free-tier rate limit or quota reached. Wait a minute and try again.'
  if (status >= 500) return 'Gemini is experiencing high demand right now. Please try again in a moment.'
  return `Gemini request failed (${status}). ${detail}`.trim()
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return errorResponse('Vision AI is not configured: the GEMINI_API_KEY environment variable is missing on the server.', 500)
  }
  const models = [...new Set([process.env.GEMINI_MODEL, ...FALLBACK_MODELS].filter((m): m is string => Boolean(m)))]

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid request body.', 400)
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse('Please provide a valid image (PNG, JPG or WEBP) under 6 MB.', 400)
  }

  const [, mediaType, base64] = parsed.data.image.match(/^data:(image\/[a-z+]+);base64,([\s\S]*)$/i) ?? []
  if (!mediaType || !base64) {
    return errorResponse('Please provide a valid image (PNG, JPG or WEBP).', 400)
  }

  const requestBody = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: mediaType.toLowerCase(), data: base64 } },
          { text: 'Identify and classify the waste item in this photo.' },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema,
    },
  })

  const deadline = Date.now() + 55_000
  let data: GeminiResponse | null = null
  let lastFailure: { status: number; data: GeminiResponse | null; model: string } | null = null

  for (const model of models) {
    const remaining = deadline - Date.now()
    if (remaining < 3_000) break

    let res: Response
    try {
      res = await fetch(`${GEMINI_ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        signal: AbortSignal.timeout(remaining),
        body: requestBody,
      })
    } catch (error) {
      console.error('[ecosort] Gemini network error', model, error)
      const timedOut = error instanceof Error && error.name === 'TimeoutError'
      return errorResponse(timedOut ? 'Gemini took too long to respond. Please try again.' : 'Could not reach the Gemini API. Check your connection and try again.', 504)
    }

    const payload = (await res.json().catch(() => null)) as GeminiResponse | null
    if (res.ok) {
      data = payload
      break
    }

    console.error('[ecosort] Gemini API error', model, res.status, payload?.error?.status, payload?.error?.message)
    lastFailure = { status: res.status, data: payload, model }
    if (!RETRYABLE_STATUSES.has(res.status)) break
  }

  if (!data) {
    if (!lastFailure) return errorResponse('Gemini took too long to respond. Please try again.', 504)
    return errorResponse(describeGeminiError(lastFailure.status, lastFailure.data, lastFailure.model), lastFailure.status === 429 ? 429 : 502)
  }

  if (data?.promptFeedback?.blockReason) {
    return errorResponse('Gemini declined to analyse this image. Please try a different photo.', 422)
  }

  const candidate = data?.candidates?.[0]
  const text = candidate?.content?.parts?.map((p) => p.text ?? '').join('')
  if (!text) {
    console.error('[ecosort] Gemini returned no content', candidate?.finishReason)
    return errorResponse('Gemini returned an empty result. Please try again with a clearer photo.', 502)
  }

  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    console.error('[ecosort] Gemini returned non-JSON output')
    return errorResponse('Gemini returned an unreadable result. Please try again.', 502)
  }

  const result = analysisSchema.safeParse(json)
  if (!result.success) {
    console.error('[ecosort] Gemini output failed validation', result.error.issues)
    return errorResponse('Gemini returned an incomplete result. Please try again.', 502)
  }

  return Response.json(result.data)
}
