export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.GEMINI_API_KEY) {
      return Response.json(
        { message: "Missing GEMINI_API_KEY on server." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { notes, reportType } = body;

    if (!notes || String(notes).trim().length < 5) {
      return Response.json(
        { message: "Please enter enough notes to generate a log." },
        { status: 400 }
      );
    }

    const prompt = `
You are SkipperOS AI, a maritime operations assistant for small fishing fleets, charter boats, dive boats, tour boats, and workboats.

Convert the rough skipper notes below into a clean professional operational log.

Rules:
- Do not invent facts.
- If something is missing, write "Not provided".
- Keep it practical and professional.
- Use clear headings.
- Do not claim legal compliance.
- Add a final note saying the operator should review before submission.

Report type: ${reportType || "General vessel log"}

Raw skipper notes:
${notes}

Create the log with these sections:
1. Operation Summary
2. Vessel / Crew Details
3. Date, Time and Location
4. Weather / Sea Conditions
5. Fuel / Engine Notes
6. Maintenance Follow-Up
7. Safety / Incident Notes
8. Client / Catch / Job Record
9. Compliance Review Notes
10. Final Professional Log
`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1600,
          },
        }),
      }
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      return Response.json(
        {
          message:
            data?.error?.message || "Gemini failed to generate the log.",
        },
        { status: 500 }
      );
    }

    const report =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("\n")
        .trim() || "";

    if (!report) {
      return Response.json(
        { message: "Gemini returned an empty report." },
        { status: 500 }
      );
    }

    return Response.json({ report });
  } catch (error) {
    return Response.json(
      { message: error?.message || "Server error while generating log." },
      { status: 500 }
    );
  }
}