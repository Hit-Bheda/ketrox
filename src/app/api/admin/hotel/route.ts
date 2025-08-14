import { staffSchema } from "@/schemas";

export async function POST(request: Request) {
    const body = await request.json();
    const parsed = staffSchema.safeParse(body);
  
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
  
    const { name, email, password, role,phone } = parsed.data;
  
    try {
      const baseURL =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
      const signupResponse = await fetch(`${baseURL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          password,
          name,
          role
        })
      });
  
      const result = await signupResponse.json();
  
      if (!signupResponse.ok) {
        return Response.json(
          { error: result?.error || "Failed to create staff" },
          { status: 400 }
        );
      }
  
      return Response.json({
        message: "Staff created successfully",
        userId:
          result?.data?.user?.id ?? result?.user?.id ?? null
      });
    } catch (err) {
      console.error("Error creating staff:", err);
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }