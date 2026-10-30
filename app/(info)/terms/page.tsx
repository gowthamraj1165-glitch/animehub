import type { Metadata } from "next";
import { SimplePage } from "@/components/content/SimplePage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use AnimeHub.",
};

export default function TermsPage() {
  return (
    <SimplePage
      title="Terms of Service"
      intro="By using AnimeHub you agree to the points below."
      draft
    >
      <h2>1. Use of the service</h2>
      <p>
        AnimeHub is provided as-is, without warranty of any kind. You may use it for
        personal, non-commercial purposes. Do not attempt to disrupt the service,
        scrape it at volume, or resell access.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You are responsible for keeping your login credentials secure and for
        activity under your account. You must be old enough to consent to data
        processing in your country.
      </p>

      <h2>3. Content</h2>
      <p>
        Series metadata is sourced from third parties and remains the property of its
        respective owners. AnimeHub does not claim ownership of any anime, artwork or
        trademarks shown on the site.
      </p>

      <h2>4. Changes</h2>
      <p>
        These terms may change as the project develops. Continued use after an update
        means you accept the revised version.
      </p>
    </SimplePage>
  );
}
