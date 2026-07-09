"use client";

import { useState } from "react";
import { Mail, Github, Linkedin, Phone, MapPin } from "lucide-react";
import { Section } from "@/components/system/section";
import { Container } from "@/components/system/container";
import { Eyebrow } from "@/components/system/eyebrow";
import { DisplayHeading } from "@/components/system/display-heading";
import { PillButton } from "@/components/system/pill-button";
import { profile } from "@/lib/data/profile";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("send failed");
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-rule bg-paper-2 px-4 py-3 text-ink placeholder:text-stone focus:border-gold focus:outline-none";

  const links = [
    { icon: Mail, label: profile.email, href: `mailto:${profile.email}` },
    { icon: Github, label: "github.com/Rejhinald", href: profile.socials[0].url },
    { icon: Linkedin, label: "in/arwin-miclat", href: profile.socials[1].url },
    { icon: Phone, label: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: profile.location, href: undefined },
  ];

  return (
    <Section id="contact" surface="paper">
      <Container>
        <div className="grid gap-14 md:grid-cols-2 md:gap-20">
          <div>
            <Eyebrow>連絡 · CONTACT</Eyebrow>
            <DisplayHeading
              as="h2"
              animate="fade-up"
              className="type-section-title mt-6"
            >
              Let&apos;s build something.
            </DisplayHeading>
            <p className="mt-4 max-w-md text-ink-2">
              Have a project, a role, or just want to talk shop? Drop a line —
              I read everything.
            </p>

            <ul className="mt-8 space-y-3">
              {links.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-3 text-ink-2 transition-colors hover:text-shu"
                    >
                      <Icon size={18} className="text-gold-deep" />
                      {label}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-3 text-ink-2">
                      <Icon size={18} className="text-gold-deep" />
                      {label}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <PillButton
                href={profile.cvHref}
                target="_blank"
                variant="ghost"
                arrow={false}
              >
                Download CV
              </PillButton>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
            <input
              type="email"
              required
              placeholder="Your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
            <textarea
              required
              rows={5}
              placeholder="Your message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`${inputClass} resize-none`}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-shu px-8 py-4 text-sm font-medium text-paper transition-colors hover:bg-shu-deep disabled:opacity-60"
            >
              {status === "sending"
                ? "Sending…"
                : status === "sent"
                  ? "Sent — thank you!"
                  : "Send message"}
            </button>
            {status === "error" && (
              <p className="text-sm text-shu">
                Something went wrong. Email me directly at {profile.email}.
              </p>
            )}
          </form>
        </div>
      </Container>
    </Section>
  );
}
