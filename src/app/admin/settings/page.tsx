import { currentSettings, emptyCatalog } from "@/lib/catalog";
import { read } from "@/lib/server/store";
import { Card, PageHeader } from "@/components/admin/bits";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await read((db) => currentSettings(db.catalog ?? emptyCatalog()));
  return (
    <>
      <PageHeader title="Store settings" sub="The message bar at the top of every page, and shipping charges." />
      <Card>
        <SettingsForm settings={settings} />
      </Card>
    </>
  );
}
