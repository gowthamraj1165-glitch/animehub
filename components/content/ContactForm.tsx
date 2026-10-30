"use client";

import { useState, type FormEvent } from "react";
import { buttonClass } from "@/components/ui/button";

export type ContactTopic = "general" | "support" | "dmca" | "other";

const TOPIC_LABELS: Record<ContactTopic, string> = {
  general: "General question",
  support: "Support / playback help",
  dmca: "DMCA takedown",
  other: "Something else",
};

type ContactFormProps = {
  defaultTopic?: ContactTopic;
};

/**
 * Zero-backend contact form: composes a `mailto:` link with the chosen topic
 * and hands it to the visitor's mail client. No data leaves the browser until
 * the user actually sends the message.
 */
export function ContactForm({ defaultTopic = "general" }: ContactFormProps) {
  const [topic, setTopic] = useState<ContactTopic>(defaultTopic);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = encodeURIComponent(`AnimeHub — ${TOPIC_LABELS[topic]}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:hello@example.com?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-line bg-surface/60 p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Topic</span>
          <select
            name="topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value as ContactTopic)}
            className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
          >
            <option value="general">General question</option>
            <option value="support">Support / playback help</option>
            <option value="dmca">DMCA takedown</option>
            <option value="other">Something else</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Name</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-ink">Message</span>
          <textarea
            name="message"
            required
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="How can we help?"
            className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
          />
        </label>
      </div>

      <div className="mt-4">
        <button type="submit" className={buttonClass("primary", "sm")}>
          Send via email client
        </button>
      </div>
    </form>
  );
}
