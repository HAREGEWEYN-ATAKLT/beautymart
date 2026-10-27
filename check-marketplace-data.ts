import { prisma } from "./lib/prisma";

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
          productName: true,
          isActive: true,
          price: true,
          category: {
            select: { categoryName: true },
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
