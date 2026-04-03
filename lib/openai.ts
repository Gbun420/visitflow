import OpenAI from 'openai'
import { wrapOpenAI } from "braintrust"

export const openai = wrapOpenAI(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
}))

export async function generateText(prompt: string, system = 'You are a helpful assistant.'): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  })
  return response.choices[0]?.message?.content || ''
}

export async function generateJSON<T>(prompt: string, system = 'You are a helpful assistant.'): Promise<T> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })
  const content = response.choices[0]?.message?.content || '{}'
  return JSON.parse(content) as T
}
