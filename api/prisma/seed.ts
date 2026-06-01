import "dotenv/config"
import argon2 from "argon2"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env")
}

const hash = await argon2.hash(password)

await prisma.user.upsert({
    where: { email },
    update: { role: "admin" },
    create: { email, password: hash, role: "admin" },
})

console.log(`Admin user seeded: ${email}`)
await prisma.$disconnect()
