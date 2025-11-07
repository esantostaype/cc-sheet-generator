import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userId = '114240449' // ID del usuario específico
  const startDate = new Date('2025-06-30T00:00:00Z') // 30 de junio de 2025
  const endDate = new Date('2025-07-03T23:59:59Z')   // 3 de julio de 2025

  console.log(`Intentando establecer vacaciones para el usuario ${userId} del ${startDate.toISOString()} al ${endDate.toISOString()}`)

  try {
    // Primero, verifica si el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      console.error(`Error: Usuario con ID ${userId} no encontrado. Asegúrate de que el usuario exista en la base de datos.`)
      return
    }

    // Crea la entrada de vacaciones
    const vacation = await prisma.userVacation.upsert({
      where: {
        userId_startDate_endDate: {
          userId: userId,
          startDate: startDate,
          endDate: endDate,
        },
      },
      update: {}, // No actualizar si ya existe con la misma clave única
      create: {
        userId: userId,
        startDate: startDate,
        endDate: endDate,
      },
    })
    console.log(`Vacaciones establecidas exitosamente para el usuario ${user.name} (ID: ${userId})`)
    console.log(`Detalles de Vacaciones:`, vacation)

  } catch (error) {
    console.error('Error al establecer las vacaciones:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()