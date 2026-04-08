const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestOptions extends Omit<RequestInit, "body" | "method"> {
  body?: BodyInit | object | null;
  method?: RequestMethod;
  token?: string | null;
}

function buildHeaders(
  headers: HeadersInit | undefined,
  token: string | null | undefined,
  body: ApiRequestOptions["body"],
) {
  const requestHeaders = new Headers(headers);

  if (body && !(body instanceof FormData) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  return requestHeaders;
}

export async function apiRequest<T>(
  path: string,
  { body, method = "GET", token, headers, ...init }: ApiRequestOptions = {},
): Promise<T> {
  const requestHeaders = buildHeaders(headers, token, body);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method,
    headers: requestHeaders,
    body:
      body && !(body instanceof FormData) && typeof body !== "string"
        ? JSON.stringify(body)
        : body ?? undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorPayload = (await response.json()) as { detail?: string };
      if (errorPayload.detail) {
        message = errorPayload.detail;
      }
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
