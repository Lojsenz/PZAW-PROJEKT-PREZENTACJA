import { Router } from "express"
import { prisma } from "../db"

const router = Router()

async function getSession(sid: string) {
    const session = await prisma.session.findUnique({ where: { id: sid } })
    if (!session || session.expiresAt < new Date()) return null
    return session
}

router.get("/", async (req, res) => {
    const sid = req.cookies?.sid
    if (!sid) { res.status(401).json({ message: "Not authenticated" }); return }

    const session = await getSession(sid)
    if (!session) { res.status(401).json({ message: "Session expired" }); return }

    const posts = await prisma.post.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
    })

    res.json(posts)
})

router.post("/", async (req, res) => {
    const sid = req.cookies?.sid
    if (!sid) { res.status(401).json({ message: "Not authenticated" }); return }

    const session = await getSession(sid)
    if (!session) { res.status(401).json({ message: "Session expired" }); return }

    const { title, content } = req.body
    if (!title || !content) { res.status(400).json({ message: "Title and content are required" }); return }

    const post = await prisma.post.create({
        data: { userId: session.userId, title, content },
    })

    res.json(post)
})

router.get("/random", async (req, res) => {
    const sid = req.cookies?.sid
    if (!sid) { res.status(401).json({message: "Not authenticated"});return }
    const session = await getSession(sid)
    if (!session) {res.status(401).json({message: "Session expired"}); return}

    const posts = await prisma.$queryRaw<{ id: string; title: string; content: string; createdAt: Date }[]>`
        SELECT id, title, content, "createdAt" FROM "Post" ORDER BY RANDOM() LIMIT 8
    `
    res.json(posts)
})

router.delete("/:id", async (req, res) => {
    const sid = req.cookies?.sid
    if (!sid) { res.status(401).json({ message: "Not authenticated" }); return }

    const session = await getSession(sid)
    if (!session) { res.status(401).json({ message: "Session expired" }); return }

    const post = await prisma.post.findUnique({ where: { id: req.params.id } })
    if (!post || post.userId !== session.userId) { res.status(404).json({ message: "Post doesn't exists" }); return }

    await prisma.post.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
})



export default router
