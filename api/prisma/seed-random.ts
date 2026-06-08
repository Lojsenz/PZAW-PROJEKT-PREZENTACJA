import "dotenv/config"
import argon2 from "argon2"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const USER_COUNT = 15
const MIN_POSTS_PER_USER = 1
const MAX_POSTS_PER_USER = 5
const PASSWORD = "password"

const firstNames = [
    "Anna", "Jan", "Maria", "Piotr", "Katarzyna", "Tomasz", "Magdalena", "Paweł",
    "Agnieszka", "Marek", "Ewa", "Michał", "Joanna", "Krzysztof", "Aleksandra",
    "Łukasz", "Natalia", "Adam", "Karolina", "Wojciech",
]

const lastNames = [
    "Nowak", "Kowalski", "Wiśniewski", "Wójcik", "Kowalczyk", "Kamiński",
    "Lewandowski", "Zieliński", "Szymański", "Woźniak", "Dąbrowski", "Kozłowski",
    "Jankowski", "Mazur", "Kwiatkowski",
]

const titleWords = [
    "Sekrety", "Przewodnik po", "Jak zacząć z", "Wprowadzenie do", "Refleksje na temat",
    "Najlepsze praktyki w", "Historia", "Przyszłość", "Analiza", "Krótkie spojrzenie na",
]

const topics = [
    "programowaniu", "podróżach", "kuchni", "muzyce", "sporcie", "filmach",
    "książkach", "technologii", "sztuce", "ogrodnictwie", "fotografii", "designie",
]

const sentences = [
    "To temat, który od dawna mnie fascynuje.",
    "Dziś chciałbym podzielić się z wami swoimi przemyśleniami.",
    "Nie spodziewałem się, że to będzie aż tak ciekawe.",
    "Wiele osób pyta mnie, jak zacząć przygodę z tym tematem.",
    "Poniżej znajdziecie kilka praktycznych wskazówek.",
    "Mam nadzieję, że ten wpis okaże się dla was przydatny.",
    "Zebrałem swoje doświadczenia w jednym miejscu.",
    "To dopiero początek mojej przygody z tym tematem.",
    "Zapraszam do dyskusji w komentarzach.",
    "Do zobaczenia w kolejnym wpisie!",
]

function pick<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)]
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomTitle(): string {
    return `${pick(titleWords)} ${pick(topics)}`
}

function randomContent(): string {
    const count = randomInt(3, 6)
    return Array.from({ length: count }, () => pick(sentences)).join(" ")
}

const passwordHash = await argon2.hash(PASSWORD)

for (let i = 0; i < USER_COUNT; i++) {
    const firstName = pick(firstNames)
    const lastName = pick(lastNames)
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, password: passwordHash, role: "user" },
    })

    const postCount = randomInt(MIN_POSTS_PER_USER, MAX_POSTS_PER_USER)
    for (let j = 0; j < postCount; j++) {
        await prisma.post.create({
            data: {
                userId: user.id,
                title: randomTitle(),
                content: randomContent(),
            },
        })
    }

    console.log(`Seeded user ${email} with ${postCount} post(s)`)
}

console.log(`Done. Seeded ${USER_COUNT} users (password: "${PASSWORD}").`)
await prisma.$disconnect()
