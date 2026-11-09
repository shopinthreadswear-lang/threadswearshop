import Link from "next/link";
import { currentContact, currentHome, deriveProducts, emptyCatalog } from "@/lib/catalog";
import { read } from "@/lib/server/store";
import { Card, PageHeader, Tabs } from "@/components/admin/bits";
import { QuickAction } from "@/components/admin/forms";
import { resetContent } from "@/app/admin/actions";
import { ContactForm, HeroForm, HomeTextForm } from "./ContentForms";

export const metadata = { title: "Site content" };

const TABS = [
  { key: "hero", label: "Homepage hero", href: "/admin/content" },
  { key: "home", label: "Homepage sections", href: "/admin/content?tab=home" },
  { key: "contact", label: "Contact & social", href: "/admin/content?tab=contact" },
];

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "hero" } = await searchParams;
  const current = TABS.some((t) => t.key === tab) ? tab : "hero";
  const data = await read((db) => {
    const state = db.catalog ?? emptyCatalog();
    return {
      home: currentHome(state),
      contact: currentContact(state),
      editedHome: !!state.content?.home,
      editedContact: !!state.content?.contact,
      products: deriveProducts(state).map((p) => ({ slug: p.slug, name: p.name })).sort((a, b) => a.name.localeCompare(b.name)),
    };
  });

  return (
    <>
      <PageHeader
        title="Site content"
        sub={<>Change the words and photos customers see. Saved changes go live straight away — <Link href="/" target="_blank" className="font-semibold text-burgundy hover:underline">open the shop ↗</Link></>}
      />
      <Tabs items={TABS} current={current} />

      {current === "hero" && (
        <Card
          title="Homepage hero"
          action={data.editedHome ? <QuickAction action={resetContent} fields={{ section: "home" }} label="Restore original homepage" confirm="Put the whole homepage (hero and sections) back to the original words and photos?" /> : undefined}
        >
          <HeroForm slides={data.home.hero} products={data.products} />
        </Card>
      )}

      {current === "home" && (
        <Card title="Homepage sections">
          <HomeTextForm home={data.home} />
        </Card>
      )}

      {current === "contact" && (
        <Card
          title="Contact details & social links"
          action={data.editedContact ? <QuickAction action={resetContent} fields={{ section: "contact" }} label="Restore original" confirm="Put the contact details and social links back to the original?" /> : undefined}
        >
          <ContactForm contact={data.contact} />
        </Card>
      )}
    </>
  );
}
