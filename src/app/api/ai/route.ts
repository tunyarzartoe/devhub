import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    const customApiKey = request.headers.get("x-openai-api-key")?.trim();
    const apiKey = customApiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OpenAI API key not found. Please provide an API key in the AI Assistant settings or configure OPENAI_API_KEY in .env.local on the server.",
          needsKey: true,
        },
        { status: 503 },
      );
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const { prompt, messages, model } = body as {
      prompt?: string;
      messages?: ChatMessage[];
      model?: string;
    };

    const targetModel = model || process.env.OPENAI_MODEL || "gpt-4o-mini";
    const client = new OpenAI({ apiKey });

    // Build chat message history
    const systemPrompt = "You are DevHub AI, an expert software engineering assistant built into the DevHub developer workspace. You provide clear, concise, and production-ready solutions. Format code with appropriate language markdown code blocks. Point out security or performance implications when relevant. Be direct and helpful.";

    let chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (Array.isArray(messages) && messages.length > 0) {
      chatMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: String(m.content).slice(0, 8000),
        })),
      ];
    } else if (typeof prompt === "string" && prompt.trim()) {
      if (prompt.length > 15000) {
        return NextResponse.json({ error: "Prompt exceeds 15,000 characters." }, { status: 413 });
      }
      chatMessages.push({ role: "user", content: prompt.trim() });
    } else {
      return NextResponse.json({ error: "A message prompt is required." }, { status: 400 });
    }

    // Try chat.completions first (compatible with all OpenAI models including gpt-4o, gpt-4o-mini, gpt-3.5-turbo, etc.)
    try {
      const completion = await client.chat.completions.create({
        model: targetModel,
        messages: chatMessages,
        max_tokens: 2000,
      });

      const reply = completion.choices[0]?.message?.content || "No response returned.";
      return NextResponse.json({ answer: reply, model: targetModel });
    } catch (chatError) {
      // Fallback to responses API if model specifically requires it
      if (typeof prompt === "string") {
        try {
          const resp = await client.responses.create({
            model: targetModel,
            instructions: systemPrompt,
            input: prompt,
            max_output_tokens: 2000,
          });
          return NextResponse.json({ answer: resp.output_text || "No response returned.", model: targetModel });
        } catch {
          // If fallback fails, throw original chatError
          throw chatError;
        }
      }
      throw chatError;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: `AI request failed: ${message}` }, { status: 500 });
  }
}

