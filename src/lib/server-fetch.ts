const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';

/** Server-side fetch that never throws — returns null when the API is unreachable. */
export async function safeServerFetch(
  path: string,
  revalidateSeconds: number,
): Promise<Response | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: revalidateSeconds },
      signal: AbortSignal.timeout(8000),
    });
    return res;
  } catch {
    return null;
  }
}

export { API_BASE };
