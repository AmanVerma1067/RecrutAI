import { parseResumeFromText } from "@recruitai/ai-service";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "../../../lib/rate-limit";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const rateKey = request.headers.get("x-forwarded-for") ?? "anonymous";

  if (!enforceRateLimit({ key: `parse:${rateKey}`, limit: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing resume file" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    let rawText: string;

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const arrayBuffer = await file.arrayBuffer();
      
      try {
        // Use pdf2json, which is pure JS and works safely on Vercel
        const PDFParser = (await import("pdf2json")).default;
        
        rawText = await new Promise<string>((resolve, reject) => {
          const pdfParser = new PDFParser(undefined, true); // true = text parsing mode
          
          pdfParser.on("pdfParser_dataError", (errData: any) => {
            reject(errData?.parserError || new Error("PDF parsing failed"));
          });
          
          pdfParser.on("pdfParser_dataReady", () => {
             // pdf2json provides extracted text directly
             resolve(pdfParser.getRawTextContent());
          });
          
          // pdf2json requires a Buffer
          pdfParser.parseBuffer(Buffer.from(arrayBuffer));
        });

      } catch (pdfError) {
        console.warn("pdf2json failed, attempting basic raw text fallback:", pdfError);
        // Fallback: try to extract readable text from PDF binary
        const decoder = new TextDecoder("utf-8", { fatal: false });
        const rawContent = decoder.decode(arrayBuffer);
        // Extract text between PDF stream markers and parentheses
        const textParts: string[] = [];
        const parenRegex = /\(([^)]{2,})\)/g;
        let match: RegExpExecArray | null;
        while ((match = parenRegex.exec(rawContent)) !== null) {
          const text = match[1];
          if (text && /[a-zA-Z]{2,}/.test(text)) {
            textParts.push(text);
          }
        }
        rawText = textParts.join(" ");

        if (!rawText.trim()) {
          return NextResponse.json(
            { error: "Could not extract text from PDF. Please try uploading a plain text (.txt) version of your resume instead." },
            { status: 422 }
          );
        }
      }
    } else {
      rawText = await file.text();
    }

    if (!rawText.trim()) {
      return NextResponse.json({ error: "Could not extract text from the file. Try a different PDF." }, { status: 422 });
    }

    const parsedResume = await parseResumeFromText(rawText);

    return NextResponse.json({ parsedResume });
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume. Please try a different file.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

