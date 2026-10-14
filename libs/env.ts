import "server-only";

/**
 * Server-only config. The browser never calls the backend directly (staging
 * sends no CORS headers), so the API URL lives here and is used only by the
 * /api/* route handlers. It is never shipped in the client bundle.
 */
export const env = {
  get apiUrl(): string {
    const value = process.env.API_URL;
    if (!value) {
      throw new Error("API_URL is not set — copy .env.example to .env.local");
    }
    return value.replace(/\/+$/, "");
  },
};
