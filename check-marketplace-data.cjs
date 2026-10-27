require("dotenv/config");

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("./app/generated/prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const stores = await prisma.store.findMany({
    select: {
      storeId: true,
      storeName: true,
      status: true,
      subscription: {
        select: {
          planType: true,
          status: true,
          isActive: true,
          startDate: true,
          endDate: true,
        },
      },
      products: {
        select: {
          name: true,
          isActive: true,
          price: true,
          category: {
            select: { name: true },
          },
        },
      },
    },
  });

  console.dir(stores, { depth: 6 });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
