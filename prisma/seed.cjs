/* eslint-disable @typescript-eslint/no-require-imports */
// prisma/seed.cjs - VERSIÓN CORREGIDA
// Ejecutar con: npx prisma db seed

const { PrismaClient, Tier } = require("@prisma/client");

let prisma; // Declara prisma con let para poder asignarlo en el try/catch

// Definir las duraciones por defecto para cada Tier
const tierDurations = {
  S: 5,
  A: 3,
  B: 2,
  C: 1,
  D: 0.5,
  E: 0.25,
};

async function main() {
  console.log("🌱 Iniciando seeding...");

  // 0. Limpiar datos existentes (¡CUIDADO! Esto borrará todos los datos en estas tablas)
  console.log("\n--- Limpiando datos existentes ---");

  try {
    await prisma.syncLog.deleteMany();
    console.log("✅ SyncLog limpiado");

    await prisma.taskAssignment.deleteMany();
    console.log("✅ TaskAssignment limpiado");

    await prisma.task.deleteMany();
    console.log("✅ Task limpiado");

    await prisma.userVacation.deleteMany();
    console.log("✅ UserVacation limpiado");

    await prisma.userRole.deleteMany();
    console.log("✅ UserRole limpiado");

    await prisma.taskCategory.deleteMany();
    console.log("✅ TaskCategory limpiado");

    await prisma.taskType.deleteMany();
    console.log("✅ TaskType limpiado");

    await prisma.tierList.deleteMany();
    console.log("✅ TierList limpiado");

    await prisma.user.deleteMany();
    console.log("✅ User limpiado");

    await prisma.brand.deleteMany();
    console.log("✅ Brand limpiado");

    console.log("✅ Datos antiguos eliminados.");
  } catch (error) {
    console.error("❌ Error limpiando datos:", error);
    throw error;
  }

  // 1. Seed de TierList (los tiers y sus duraciones por defecto)
  console.log("\n--- Seeding TierList ---");
  const seededTiers = {}; // Para almacenar los objetos TierList creados

  try {
    for (const tierName of Object.keys(Tier)) {
      const defaultDuration = tierDurations[tierName];
      if (defaultDuration === undefined) {
        console.warn(
          `⚠️ Duración no definida para el Tier: ${tierName}. Saltando.`
        );
        continue;
      }
      const tier = await prisma.tierList.upsert({
        where: { name: tierName },
        update: { duration: defaultDuration },
        create: { name: tierName, duration: defaultDuration },
      });
      seededTiers[tier.name] = tier; // Guardar el objeto tier completo
      console.log(
        `✅ Upserted Tier: ${tier.name} (Duration: ${tier.duration} days)`
      );
    }
  } catch (error) {
    console.error("❌ Error creando TierList:", error);
    throw error;
  }

  // 2. Seed de Brand
  console.log("\n--- Seeding Brands ---");
  const brandData = [
    {
      id: "901700182493",
      name: "Inszone",
      spaceId: "90170091121",
      folderId: "90120123456",
      teamId: "90170099166",
      isActive: true,
      description: "Main Inszone brand for insurance services",
      defaultStatus: "TO_DO",
    },
    {
      id: "901700182489",
      name: "R.E. Chaix",
      spaceId: "90170091121",
      folderId: "90120123456",
      teamId: "90170099166",
      isActive: true,
      description: "R.E. Chaix brand for specialized insurance",
      defaultStatus: "TO_DO",
    },
    {
      id: "901704229078",
      name: "Pinney",
      spaceId: "90170091121",
      folderId: "90120123456",
      teamId: "90170099166",
      isActive: true,
      description: "Pinney brand for life insurance solutions",
      defaultStatus: "TO_DO",
    },
  ];

  try {
    for (const brand of brandData) {
      await prisma.brand.upsert({
        where: { id: brand.id },
        update: brand,
        create: brand,
      });
      console.log(`✅ Upserted Brand: ${brand.name}`);
    }
  } catch (error) {
    console.error("❌ Error creando Brands:", error);
    throw error;
  }

  // 3. Seed de User
  console.log("\n--- Seeding Users ---");
  const userData = [
    {
      id: "114240449", // ClickUp ID
      name: "Erick Santos",
      email: "esantos@inszoneins.com",
      active: true,
    },
    {
      id: "114217194", // ClickUp ID
      name: "Diego Ganoza",
      email: "dganoza@inszoneins.com",
      active: true,
    },
    {
      id: "114217195", // ClickUp ID
      name: "Dayana Viggiani",
      email: "dviggiani@inszoneins.com",
      active: true,
    },
  ];
  const allUsers = {}; // Para almacenar los objetos User creados

  try {
    for (const user of userData) {
      const createdUser = await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
      allUsers[createdUser.name] = createdUser;
      console.log(`✅ Upserted User: ${createdUser.name}`);
    }
  } catch (error) {
    console.error("❌ Error creando Users:", error);
    throw error;
  }

  // 4. Seed de TaskType y TaskCategory (ahora con relación a TierList)
  console.log("\n--- Seeding TaskTypes and TaskCategories ---");

  // Define las categorías con su tipo y nombre de tier
  const categoriesToCreate = [
    // UX/UI Design Categories
    {
      name: "UX Research",
      typeName: "UX/UI Design",
      tierName: Tier.A,
    },
    {
      name: "Wireframing",
      typeName: "UX/UI Design",
      tierName: Tier.B,
    },
    {
      name: "UI Design",
      typeName: "UX/UI Design",
      tierName: Tier.B,
    },
    {
      name: "Usability Testing",
      typeName: "UX/UI Design",
      tierName: Tier.C,
    },
    {
      name: "Prototyping",
      typeName: "UX/UI Design",
      tierName: Tier.C,
    },
    {
      name: "Full website with multiple levels",
      typeName: "UX/UI Design",
      tierName: Tier.S,
    },
    {
      name: "UX/UI for SaaS or B2B platform",
      typeName: "UX/UI Design",
      tierName: Tier.S,
    },
    {
      name: "Design system with documentation",
      typeName: "UX/UI Design",
      tierName: Tier.S,
    },
    {
      name: "Mobile app (15+ screens)",
      typeName: "UX/UI Design",
      tierName: Tier.S,
    },
    {
      name: "Validated MVP prototype",
      typeName: "UX/UI Design",
      tierName: Tier.S,
    },
    {
      name: "Cross-platform design",
      typeName: "UX/UI Design",
      tierName: Tier.S,
    },
    {
      name: "Complex intranet section",
      typeName: "UX/UI Design",
      tierName: Tier.A,
    },
    {
      name: "Corporate website (5–7 sections)",
      typeName: "UX/UI Design",
      tierName: Tier.A,
    },
    {
      name: "Prototype with microinteractions",
      typeName: "UX/UI Design",
      tierName: Tier.A,
    },
    {
      name: "Intermediate design system",
      typeName: "UX/UI Design",
      tierName: Tier.A,
    },
    {
      name: "Dashboard with charts and filters",
      typeName: "UX/UI Design",
      tierName: Tier.A,
    },
    {
      name: "UX for onboarding or sign-up",
      typeName: "UX/UI Design",
      tierName: Tier.A,
    },
    {
      name: "Full redesign of site/app",
      typeName: "UX/UI Design",
      tierName: Tier.A,
    },
    {
      name: "Simple intranet section",
      typeName: "UX/UI Design",
      tierName: Tier.B,
    },
    {
      name: "Landing page design",
      typeName: "UX/UI Design",
      tierName: Tier.B,
    },
    {
      name: "Complex internal pages",
      typeName: "UX/UI Design",
      tierName: Tier.B,
    },
    {
      name: "3–5 UI screens",
      typeName: "UX/UI Design",
      tierName: Tier.B,
    },
    {
      name: "Component with states/variants",
      typeName: "UX/UI Design",
      tierName: Tier.B,
    },
    {
      name: "Simple clickable prototype",
      typeName: "UX/UI Design",
      tierName: Tier.B,
    },
    {
      name: "Wireframes + simple mockup",
      typeName: "UX/UI Design",
      tierName: Tier.B,
    },
    {
      name: "Responsive views of same page",
      typeName: "UX/UI Design",
      tierName: Tier.B,
    },
    {
      name: "New section in existing page",
      typeName: "UX/UI Design",
      tierName: Tier.C,
    },
    {
      name: "Mobile version of a page",
      typeName: "UX/UI Design",
      tierName: Tier.C,
    },
    {
      name: "Simple view design",
      typeName: "UX/UI Design",
      tierName: Tier.C,
    },
    {
      name: "Web banner adaptation",
      typeName: "UX/UI Design",
      tierName: Tier.C,
    },
    {
      name: "Simple button/component states",
      typeName: "UX/UI Design",
      tierName: Tier.C,
    },
    {
      name: "Copy changes",
      typeName: "UX/UI Design",
      tierName: Tier.D,
    },
    {
      name: "Icon/image updates",
      typeName: "UX/UI Design",
      tierName: Tier.D,
    },
    {
      name: "Spacing or padding adjustments",
      typeName: "UX/UI Design",
      tierName: Tier.D,
    },
    {
      name: "Color or font edits",
      typeName: "UX/UI Design",
      tierName: Tier.D,
    },
    {
      name: "Naming/layer cleanup",
      typeName: "UX/UI Design",
      tierName: Tier.D,
    },
    {
      name: "Auto layout adjustments",
      typeName: "UX/UI Design",
      tierName: Tier.D,
    },

    // Graphic Design Categories
    {
      name: "Complete visual identity",
      typeName: "Graphic Design",
      tierName: Tier.S,
    },
    {
      name: "Complex brochure",
      typeName: "Graphic Design",
      tierName: Tier.S,
    },
    {
      name: "Simple brochure (Bi-fold/Tri-fold)",
      typeName: "Graphic Design",
      tierName: Tier.A,
    },
    {
      name: "Internal documents",
      typeName: "Graphic Design",
      tierName: Tier.A,
    },
    {
      name: "Complex infographic",
      typeName: "Graphic Design",
      tierName: Tier.A,
    },
    {
      name: "Basic brand manual",
      typeName: "Graphic Design",
      tierName: Tier.A,
    },
    {
      name: "Full packaging design",
      typeName: "Graphic Design",
      tierName: Tier.A,
    },
    {
      name: "Event/campaign graphic kit",
      typeName: "Graphic Design",
      tierName: Tier.A,
    },
    {
      name: "Ad visuals",
      typeName: "Graphic Design",
      tierName: Tier.A,
    },
    {
      name: "Social media for all brands",
      typeName: "Graphic Design",
      tierName: Tier.A,
    },
    {
      name: "PowerPoint (19–28 slides)",
      typeName: "Graphic Design",
      tierName: Tier.A,
    },
    {
      name: "Flyer or poster",
      typeName: "Graphic Design",
      tierName: Tier.B,
    },
    {
      name: "PowerPoint template",
      typeName: "Graphic Design",
      tierName: Tier.B,
    },
    {
      name: "Basic infographic",
      typeName: "Graphic Design",
      tierName: Tier.B,
    },
    {
      name: "Complex updates in artworks",
      typeName: "Graphic Design",
      tierName: Tier.B,
    },
    {
      name: "PowerPoint (12–18 slides)",
      typeName: "Graphic Design",
      tierName: Tier.B,
    },
    {
      name: "Artwork resizing",
      typeName: "Graphic Design",
      tierName: Tier.C,
    },
    {
      name: "Template-based artwork",
      typeName: "Graphic Design",
      tierName: Tier.C,
    },
    {
      name: "Business card",
      typeName: "Graphic Design",
      tierName: Tier.C,
    },
    {
      name: "Letterhead",
      typeName: "Graphic Design",
      tierName: Tier.C,
    },
    {
      name: "Intermediate updates in artworks",
      typeName: "Graphic Design",
      tierName: Tier.C,
    },
    {
      name: "PowerPoint (6–11 slides)",
      typeName: "Graphic Design",
      tierName: Tier.C,
    },
    {
      name: "Text changes in artworks",
      typeName: "Graphic Design",
      tierName: Tier.D,
    },
    {
      name: "Logo/image replacements",
      typeName: "Graphic Design",
      tierName: Tier.D,
    },
    {
      name: "File export to other formats",
      typeName: "Graphic Design",
      tierName: Tier.D,
    },
    {
      name: "Signature (Formerly operating as)",
      typeName: "Graphic Design",
      tierName: Tier.D,
    },
    {
      name: "Simple info updates in artworks",
      typeName: "Graphic Design",
      tierName: Tier.D,
    },
    {
      name: "Signature (Powered by)",
      typeName: "Graphic Design",
      tierName: Tier.E,
    },

    // General Design Categories
    {
      name: "Miscellaneous",
      typeName: "General Design",
      tierName: Tier.D,
    },
    {
      name: "Consultation",
      typeName: "General Design",
      tierName: Tier.C,
    },
  ];

  const seededTaskTypes = {}; // Para almacenar los objetos TaskType creados
  const taskTypeNames = [...new Set(categoriesToCreate.map((c) => c.typeName))]; // Obtener nombres de tipos únicos

  try {
    for (const typeName of taskTypeNames) {
      const type = await prisma.taskType.upsert({
        where: { name: typeName },
        update: {},
        create: { name: typeName },
      });
      seededTaskTypes[type.name] = type;
      console.log(`✅ Upserted TaskType: ${type.name}`);
    }

    for (const categoryData of categoriesToCreate) {
      const type = seededTaskTypes[categoryData.typeName];
      const tier = seededTiers[categoryData.tierName];

      if (!type) {
        console.error(
          `❌ Error: TaskType "${categoryData.typeName}" no encontrado para la categoría "${categoryData.name}".`
        );
        continue;
      }
      if (!tier) {
        console.error(
          `❌ Error: Tier "${categoryData.tierName}" no encontrado para la categoría "${categoryData.name}".`
        );
        continue;
      }

      // Usar la clave compuesta única para upsert
      const category = await prisma.taskCategory.upsert({
        where: {
          name_typeId: {
            name: categoryData.name,
            typeId: type.id,
          },
        },
        update: {
          tierId: tier.id,
        },
        create: {
          name: categoryData.name,
          typeId: type.id,
          tierId: tier.id,
        },
      });
      console.log(
        `✅ Upserted TaskCategory: ${category.name} (Type: ${categoryData.typeName}, Tier: ${tier.name})`
      );
    }
  } catch (error) {
    console.error("❌ Error creando TaskTypes y TaskCategories:", error);
    throw error;
  }

  // 5. Seed de UserRole
  console.log("\n--- Seeding UserRoles ---");
  const userRoleData = [
    // Erick Santos - Especialista en UX/UI
    { user: allUsers["Erick Santos"], types: ["UX/UI Design"], brandId: null },

    // Diego Ganoza - Generalista (UX/UI + Graphic)
    {
      user: allUsers["Diego Ganoza"],
      types: ["UX/UI Design", "Graphic Design"],
      brandId: null,
    },

    // Dayana Viggiani - Especialista en Graphic
    {
      user: allUsers["Dayana Viggiani"],
      types: ["Graphic Design"],
      brandId: null,
    },
  ];

  try {
    for (const roleData of userRoleData) {
      const user = roleData.user;
      if (!user) {
        console.warn(
          `⚠️ Usuario no encontrado para crear roles: ${roleData.user?.name}. Saltando.`
        );
        continue;
      }
      for (const typeName of roleData.types) {
        const type = seededTaskTypes[typeName];
        if (!type) {
          console.warn(
            `⚠️ TaskType "${typeName}" no encontrado para el rol del usuario ${user.name}. Saltando.`
          );
          continue;
        }
        const existingRole = await prisma.userRole.findFirst({
          where: {
            userId: user.id,
            typeId: type.id,
            brandId: roleData.brandId,
          },
        });

        if (!existingRole) {
          // Si no existe, crear uno nuevo
          await prisma.userRole.create({
            data: {
              userId: user.id,
              typeId: type.id,
              brandId: roleData.brandId,
            },
          });
          console.log(
            `✅ Created UserRole: ${user.name} - ${type.name} ${
              roleData.brandId ? `(Brand: ${roleData.brandId})` : "(Global)"
            }`
          );
        } else {
          console.log(
            `✅ UserRole already exists: ${user.name} - ${type.name} ${
              roleData.brandId ? `(Brand: ${roleData.brandId})` : "(Global)"
            }`
          );
        }
      }
    }
  } catch (error) {
    console.error("❌ Error creando UserRoles:", error);
    throw error;
  }
}

// Envuelve la llamada a main en un try-catch para manejar errores de inicialización de Prisma
try {
  prisma = new PrismaClient();
  main()
    .catch((e) => {
      console.error("❌ Error durante el seeding:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} catch (e) {
  console.error("❌ Error al inicializar PrismaClient:", e);
  process.exit(1);
}
