import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Catch-all API route that proxies requests to the backend FastAPI server.
 * Supports all HTTP methods and passes through FormData for file uploads.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(req, resolvedParams.slug, "POST");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(req, resolvedParams.slug, "GET");
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(req, resolvedParams.slug, "PUT");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(req, resolvedParams.slug, "PATCH");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(req, resolvedParams.slug, "DELETE");
}

async function handleApiRequest(
  req: NextRequest,
  slug: string[],
  method: string
) {
  try {
    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const path = slug.join("/");
    const backendUrl = `${backendBaseUrl}/api/v1/${path}${req.nextUrl.search}`;

    // Get the access token from cookies (no server-side refresh needed)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    // Build headers
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Prepare the body - handle both JSON and FormData
    let body: any = null;
    const contentType = req.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      body = await req.json();
      headers["Content-Type"] = "application/json";
    } else if (contentType && contentType.includes("multipart/form-data")) {
      // For file uploads, pass the FormData directly
      // Don't set Content-Type header - fetch will add it with the correct boundary
      body = await req.formData();
    } else if (method !== "GET" && method !== "DELETE") {
      // For other content types, read as text or buffer
      body = await req.text();
      if (body && contentType) {
        headers["Content-Type"] = contentType;
      }
    }

    // Make request to backend
    const backendResponse = await fetch(backendUrl, {
      method,
      headers,
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      credentials: "include",
    });

    // Get the response data
    const responseData = await backendResponse.json().catch(() => null);

    return NextResponse.json(
      responseData || { message: "No content" },
      { status: backendResponse.status }
    );
  } catch (error: any) {
    console.error(`API proxy error [${slug?.join("/")}]:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred.", details: error.message },
      { status: 500 }
    );
  }
}
