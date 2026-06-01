import { Router } from "express"
import { prisma } from "../db"

const router = Router()
const startedAt = Date.now()

router.use(async (req, res, next) => {
    const session = await prisma.session.findUnique({
        where: { id: req.cookies?.sid ?? "" },
        include: { user: true },
    })
    if (!session || session.expiresAt < new Date()) { res.status(401).json({ message: "Not authenticated" }); return }
    if (session.user.role !== "admin") { res.status(403).json({ message: "Forbidden" }); return }
    next()
})

router.get("/stats", async (_req, res) => {
    const totalUsers = await prisma.user.count()
    const totalPosts = await prisma.post.count()
    const seconds = Math.floor((Date.now() - startedAt) / 1000)
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    const uptime = `${h}h ${m}m ${s}s`
    res.json({ totalUsers, uptime, totalPosts })
})

router.get("/users", async (_req, res) => {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true },
        orderBy: { createdAt: "asc" },
    })
    res.json(users)
})

router.patch("/users/:id/role", async (req, res) => {
    const { role } = req.body
    if (role !== "user" && role !== "admin") {
        res.status(400).json({ message: "Invalid role" })
        return
    }
    await prisma.user.update({ where: { id: req.params.id }, data: { role } })
    res.json({ ok: true })
})

router.delete("/posts/:id", async (req, res) => {
    await prisma.post.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
})

export default router
