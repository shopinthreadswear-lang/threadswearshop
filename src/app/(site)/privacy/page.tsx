import { PolicyPage } from "@/components/content/PolicyPage";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { syncCatalog } from "@/lib/server/store";

export const metadata = pageMeta({ title: "Privacy Policy", description: "How Threads Ware collects, uses and protects your personal data, in line with India's Digital Personal Data Protection Act, 2023.", path: "/privacy" });

export default async function PrivacyPage() {
  await syncCatalog(); // contact details are edited in Admin → Site content
  return (
    <PolicyPage
      crumb="Privacy Policy"
      eyebrow="Legal"
      title="Privacy Policy"
      intro={<>Your trust matters. This policy explains what personal data Threads Ware Private Limited collects, why, and the choices you have — in line with the Digital Personal Data Protection Act, 2023.</>}
      updated="1 October 2026"
      sections={[
        { id: "collect", title: "Information we collect", body: <ul><li><strong>Account & order details</strong> — name, email, mobile number, delivery addresses and order history.</li><li><strong>Payment information</strong> — processed by our PCI-DSS certified partners. We store only a tokenised reference, card brand and last four digits.</li><li><strong>Usage data</strong> — pages viewed, products saved and device information, collected with your consent via cookies.</li><li><strong>Communications</strong> — messages you send to Customer Care, reviews and survey responses.</li></ul> },
        { id: "use", title: "How we use it", body: <ul><li>To process, deliver and support your orders, returns and exchanges.</li><li>To secure your account and prevent fraud.</li><li>To personalise recommendations and remember your bag and wishlist.</li><li>To send marketing communications — only with your consent, and you can opt out at any time.</li></ul> },
        { id: "share", title: "Who we share it with", body: <p>We share the minimum necessary data with trusted processors: courier partners (to deliver your order), payment gateways (to take payment), email and SMS providers (to keep you updated) and analytics tools (only with consent). We never sell your personal data.</p> },
        { id: "retention", title: "Retention & security", body: <p>Data is encrypted in transit (TLS 1.2+) and at rest. Passwords are hashed and never stored in plain text. We keep order records for 8 years as required by Indian tax law, and delete other data when it is no longer needed.</p> },
        { id: "rights", title: "Your rights", body: <p>You may access, correct or erase your personal data, withdraw consent, or nominate someone to exercise your rights. Email our Grievance Officer at <a href={`mailto:privacy@threadsware.in`}>privacy@threadsware.in</a> — we respond within 30 days.</p> },
        { id: "contact", title: "Contact", body: <p>Grievance Officer, Threads Ware Private Limited, {site.address.line1}, {site.address.line2}, {site.address.city} {site.address.pincode}. Email: privacy@threadsware.in.</p> },
      ]}
    />
  );
}
