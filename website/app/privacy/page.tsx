import Link from "next/link";

export const metadata = {
  title: "Privacy | Drowzi",
  description: "Privacy information for the Drowzi web demo.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#1A1209] px-6 py-16 text-[#F5E6C8] md:px-12">
      <article className="mx-auto max-w-2xl space-y-8 font-body leading-relaxed">
        <Link href="/" className="font-display font-bold text-[#F4C430] hover:underline">
          ← Back to Drowzi
        </Link>
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-widest text-[#F4C430]">Privacy</p>
          <h1 className="font-display text-4xl font-extrabold md:text-5xl">Drowzi web demo</h1>
          <p className="text-[#9A7A50]">Last updated: July 21, 2026</p>
        </header>
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">What the demo uses</h2>
          <p>The interactive demo can request camera and microphone permission only when you choose a gate that needs it. Those inputs are used in your browser to run the selected demo experience.</p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Local storage</h2>
          <p>Your demo setup and progress may be saved in your browser&apos;s local storage or IndexedDB so the demo can continue on this device. You can clear this information through your browser settings.</p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">No account or upload</h2>
          <p>The demo does not require an account and does not upload your camera, microphone, or demo data to Drowzi servers.</p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Before the public app launch</h2>
          <p>This is a hackathon demo. A full product privacy policy will be published before any public app-store release.</p>
        </section>
      </article>
    </main>
  );
}
