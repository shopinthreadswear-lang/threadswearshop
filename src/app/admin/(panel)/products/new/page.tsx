import { categories } from "@/data/categories";
import { getAdmin } from "@/lib/server/admin";
import { PageHeader, Card } from "@/components/admin/bits";
import { NewProductForm } from "./NewProductForm";

export const metadata = { title: "Add product" };

export default async function NewProduct() {
  await getAdmin("products");
  return (
    <>
      <PageHeader back={{ href: "/admin/products", label: "Products" }} title="Add a product" sub="It goes live in the shop as soon as you save. You can hide it or change anything afterwards." />
      <Card>
        <NewProductForm categories={categories.map((c) => ({ slug: c.slug, name: c.name, types: c.types }))} />
      </Card>
    </>
  );
}
