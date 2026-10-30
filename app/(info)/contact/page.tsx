import type { Metadata } from "next";
import { SimplePage } from "@/components/content/SimplePage";
import { ContactForm } from "@/components/content/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the AnimeHub team.",
};

export default function ContactPage() {
  return (
    <SimplePage
      title="Contact"
      intro="Questions, bug reports and takedown requests all go to one inbox."
      draft
    >
      <p>
        Email{" "}
        <a href="mailto:hello@example.com">hello@example.com</a> and include the
        page URL if you are reporting a problem with a specific series or episode.
      </p>

      <h2>Response times</h2>
      <p>
        This is a one-person project, so expect a reply within a few days. Copyright
        and DMCA notices are prioritised — see the{" "}
        <a href="/dmca">DMCA page</a> for the required format.
      </p>

      <h2>Before you write</h2>
      <p>
        Playback problems are almost always caused by the source you were given, not
        by AnimeHub itself. Mention your browser and device so it can be reproduced.
      </p>

      <h2>Send us a message</h2>
      <p>Use the form below to open your email client and write to the team.</p>
      <ContactForm />
    </SimplePage>
  );
}
