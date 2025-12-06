import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Call your FastAPI backend login endpoint
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { error: errorData.detail || "Login failed on backend." },
        { status: backendResponse.status }
      );
    }

    const { access_token, refresh_token, token_type } = await backendResponse.json();

    // Get cookies store and set the HttpOnly cookies
    const cookieStore = await cookies();
    
    cookieStore.set("access_token", access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    if (refresh_token) {
      cookieStore.set("refresh_token", refresh_token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
    }

    return NextResponse.json({ success: true, token_type });
  } catch (error: any) {
    console.error("Login API route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
