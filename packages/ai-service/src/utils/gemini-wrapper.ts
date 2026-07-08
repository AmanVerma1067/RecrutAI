export async function runWithRetryAndTimeout<T>(
  taskName: string,
  apiCall: () => Promise<string>,
  fallbackGenerator: () => T,
  timeoutMs: number = 6000,
  maxRetries: number = 2
): Promise<T> {
  let attempt = 0;
  while (true) {
    attempt++;
    try {
      // Promise.race for timeout
      const result = await Promise.race([
        apiCall(),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout of ${timeoutMs}ms exceeded`)), timeoutMs)
        )
      ]);
      
      // Clean and parse JSON if expected
      let jsonStr = result.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }
      return JSON.parse(jsonStr) as T;
    } catch (err) {
      console.warn(`[Gemini API] Task "${taskName}" failed on attempt ${attempt}/${maxRetries + 1}:`, err);
      
      if (attempt <= maxRetries) {
        const delay = attempt * 1000; // 1s, then 2s
        console.log(`[Gemini API] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      
      console.error(`[Gemini API] Task "${taskName}" failed all attempts. Returning graceful fallback.`);
      return fallbackGenerator();
    }
  }
}
