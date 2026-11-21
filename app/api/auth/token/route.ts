
import { auth } from "@/lib/auth";
import { SignJWT } from "jose";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    // 1. Get JWT secret
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return Response.json(
        {
          success: false,
          message: "JWT_SECRET is not configured",
        },
        { status: 500 }
      );
    }

    // 2. Get Better Auth session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // 3. Check authentication
    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    // 4. Get user information
    const user = session.user;

    // 5. Convert secret to Uint8Array
    const secret = new TextEncoder().encode(jwtSecret);

    // 6. Create JWT
    const token = await new SignJWT({
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(secret);

    // 7. Send JWT response
    return Response.json({
      success: true,
      token,
      expiresIn: 900,
    });

  } catch (error) {
    console.error("JWT generation failed:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to generate authentication token",
      },
      { status: 500 }
    );
  }
}
