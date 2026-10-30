import type { Metadata } from "next";
import { SimplePage } from "@/components/content/SimplePage";
import { ContactForm } from "@/components/content/ContactForm";

export const metadata: Metadata = {
  title: "DMCA",
  description: "How to submit a copyright takedown notice to AnimeHub.",
};

export default function DmcaPage() {
  return (
    <SimplePage
      title="DMCA & Copyright"
      intro="AnimeHub hosts no video files. If something here infringes your rights, here is how to have it removed."
      draft
    >
      <h2>What this site is</h2>
      <p>
        Series pages contain metadata and artwork supplied by third-party APIs.
        Playback links, where present, point to sources chosen by the site owner or
        supplied by users. No media is stored on AnimeHub&apos;s servers.
      </p>

      <h2>Filing a notice</h2>
      <p>
        Send an email to <a href="mailto:dmca@example.com">dmca@example.com</a> with:
      </p>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Your name, address and contact details.</li>
        <li>Identification of the copyrighted work you believe is infringed.</li>
        <li>The exact AnimeHub URL(s) involved.</li>
        <li>
          A statement that you have a good-faith belief the use is not authorised.
        </li>
        <li>
          A statement, under penalty of perjury, that the information is accurate and
          that you are the rights holder or authorised to act for them.
        </li>
        <li>Your physical or electronic signature.</li>
      </ul>

      <h2>What happens next</h2>
      <p>
        Valid notices are actioned promptly — typically by removing the link or the
        page entirely. Incomplete notices will be returned with the missing points
        listed.
      </p>

      <h2>Send your notice</h2>
      <p>
        Use the contact form below to compose your takedown email. Your email client
        will open with the subject and body pre-filled — just add your signature and
        hit send.
      </p>
      <ContactForm defaultTopic="dmca" />
    </SimplePage>
  );
}
