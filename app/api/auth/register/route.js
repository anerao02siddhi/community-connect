import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req) {
  const { name, email, password, phone, role } = await req.json();

  // Validate all fields
  if (!name || !email || !password || !phone) {
    return Response.json(
      { error: "All fields (name, email, password, phone) are required" },
      { status: 400 }
    );
  }

  // Validate name: only letters and spaces
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(name)) {
    return Response.json(
      { error: "Name must contain only letters and spaces" },
      { status: 400 }
    );
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Response.json(
      { error: "Please enter a valid email address" },
      { status: 400 }
    );
  }

  // Validate phone: numeric and exactly 10 digits
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return Response.json(
      { error: "Phone must be a 10-digit number" },
      { status: 400 }
    );
  }

  // Validate password:
  // - Min 6 characters
  // - At least one uppercase
  // - At least one lowercase
  // - At least one number
  // - At least one special character
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
  if (!passwordRegex.test(password)) {
    return Response.json(
      {
        error:
          "Password must be at least 6 characters long and include uppercase, lowercase, number, and special character",
      },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    return Response.json(
      { error: "User already exists" },
      { status: 400 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: phone,
      role: role === "official" ? "official" : "user", // fallback to 'user'
      isApproved: role === "official" ? false : true,

    },
  });

  return Response.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
}
