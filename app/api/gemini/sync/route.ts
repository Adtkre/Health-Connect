import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data, allRecords, allPrescriptions, query, doctors } = body
    const model = "gemini-2.5-flash"

    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), { status: 500 })
    }

    let prompt = ""

    if (type === "record") {
      prompt = `Create exactly 3 clinical bullet points for this medical record. Each on a new line starting with •. Do not use long paragraphs - keep each bullet point concise and on its own line.

Record: ${JSON.stringify(data)}`
    } else if (type === "prescription") {
      prompt = `Summarize this prescription in 2-3 bullet points. Each on a new line starting with •. Keep each point concise.

Prescription: ${JSON.stringify(data)}`
    } else if (type === "ai_suggest") {
      prompt = `Suggest exactly 3 follow-up actions or tests. Return each as a bullet point on a separate line starting with •. Keep each point concise.

Record: ${JSON.stringify(data)}
History: ${JSON.stringify(allRecords)}`
    } else if (type === "ai_suggest_rx") {
      prompt = `List potential drug interactions or complementary medications. Return each as a bullet point on a separate line starting with •. Keep each point concise.

Prescription: ${JSON.stringify(data)}
History: ${JSON.stringify(allPrescriptions)}`
    } else if (type === "doctor_recommend") {
      prompt = `Based on the patient's symptoms and health concerns, recommend the most suitable doctors from this list. Be conversational and helpful.

Patient's symptoms/concerns: "${query}"

Available doctors:
${doctors.map((d: any) => `- ${d.name} (${d.specialty}): ${d.about}`).join("\n")}

Provide a friendly, conversational response (2-3 sentences) analyzing their concern and recommend 1-3 doctors by name and specialty. End with why you recommend them.`
    } else {
      return new Response(JSON.stringify({ error: "Unknown type" }), { status: 400 })
    }

    // Use the v1beta/generateContent endpoint (newer API)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const txt = await res.text()
      console.error("Gemini API error:", txt)
      return new Response(JSON.stringify({ error: `Gemini API error: ${txt}` }), { status: 502 })
    }

    const json = await res.json()
    const summary = json.candidates?.[0]?.content?.parts?.[0]?.text || ""

    if (!summary) {
      return new Response(JSON.stringify({ error: "No response from Gemini" }), { status: 502 })
    }

    return new Response(JSON.stringify({ summary }), { status: 200 })
  } catch (err: any) {
    console.error("Sync error:", err)
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 })
  }
}
