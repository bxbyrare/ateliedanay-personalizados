import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { slug: "canecas", name: "Canecas Personalizadas", sortOrder: 1 },
    { slug: "quadros", name: "Quadros Personalizados", sortOrder: 2 },
    { slug: "convites", name: "Convites e Papelaria", sortOrder: 3 },
    { slug: "lembrancinhas", name: "Lembrancinhas", sortOrder: 4 },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  const canecas = await prisma.category.findUniqueOrThrow({ where: { slug: "canecas" } });

  const existingProduct = await prisma.product.findUnique({ where: { slug: "caneca-personalizada-classica" } });
  if (!existingProduct) {
    await prisma.product.create({
      data: {
        slug: "caneca-personalizada-classica",
        name: "Caneca Personalizada Clássica",
        description: "Caneca de porcelana branca, personalizada com o nome ou foto que você escolher. Produto de exemplo — fotos reais em breve.",
        priceCents: 4990,
        categoryId: canecas.id,
        isActive: true,
        isFeatured: true,
        customizationFields: {
          create: [
            { label: "Nome para gravação", fieldType: "text", isRequired: true, maxLength: 40, sortOrder: 1 },
            { label: "Observações", fieldType: "textarea", isRequired: false, maxLength: 200, sortOrder: 2 },
          ],
        },
      },
    });
  }

  const adminEmail = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "admin" },
      create: { name: "Admin Ateliê da Nay", email: adminEmail, passwordHash, role: "admin" },
    });
    await prisma.cart.upsert({ where: { userId: admin.id }, update: {}, create: { userId: admin.id } });
    // eslint-disable-next-line no-console
    console.log(`Admin account ready: ${adminEmail}`);
  } else {
    // eslint-disable-next-line no-console
    console.warn("ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD not set — skipping admin account creation.");
  }
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
