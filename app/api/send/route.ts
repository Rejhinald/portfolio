import { NextRequest, NextResponse } from "next/server";
import * as React from "react";
import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";

// Destination for contact-form submissions.
const TO_EMAIL = "arwinmiclat@gmail.com";
const FROM_EMAIL = "Portfolio Contact <onboarding@resend.dev>";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }

  const { name, email, message } = (body ?? {}) as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!name || !email || !message) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { message: "Please provide a valid email address" },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Email service is not configured" },
      { status: 500 },
    );
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email,
      subject: `New message from ${name}`,
      react: React.createElement(EmailTemplate, { name, email, message }),
    });

    if (error) {
      return NextResponse.json(
        { message: "Failed to send message", error },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Message sent successfully", data });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to send message", error },
      { status: 500 },
    );
  }
}
