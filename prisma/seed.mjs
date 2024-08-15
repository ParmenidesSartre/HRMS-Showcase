import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create the SuperAdmin Role with associated RoleModulePermissions
  await prisma.role.upsert({
    where: { name: 'SuperAdmin' },
    update: {},
    create: {
      name: 'SuperAdmin',
      permissions: {
        create: [
          {
            Module: {
              connectOrCreate: {
                where: { name: 'Role' },
                create: { name: 'Role' },
              },
            },
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
            canDownload: true,
          },
        ],
      },
    },
  });

  console.log('SuperAdmin role created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
