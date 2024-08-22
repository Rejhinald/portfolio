'use server';
import { NextRequest, NextResponse } from 'next/server';
import { EmailTemplate } from '@/components/email-template';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['arwinmiclat@gmail.com'], // Replace with your destination email
      subject: `New message from ${name}`,
      react: EmailTemplate({ name, email, message }),
    });

    if (error) {
      return NextResponse.json({ message: 'Failed to send message', error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Message sent successfully', data });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to send message', error }, { status: 500 });
  }
}
