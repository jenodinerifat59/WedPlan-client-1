import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const result = await auth.api.getToken({
      headers: request.headers,
    });

    return Response.json({
      success: true,
      token: result.token,
    });
  } catch (error) {
    console.error("Better Auth JWT error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to generate Better Auth JWT",
      },
      { status: 500 }
    );
  }
}