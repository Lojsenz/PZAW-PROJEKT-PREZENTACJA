import { Router } from "express";
import argon2 from "argon2";
import { randomBytes } from "node:crypto";
import { prisma } from "../db";

const router = Router()
const SESSION = 7 * 24 * 60 * 60 * 1000

router.post("/login",async (req, res) => {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({
        where: {email}
    })
    if(!user || !(await argon2.verify(user.password, password))){
        res.status(401).json({ message: "Wrong email or password"})
        return
    }

    const sessionId = randomBytes(32).toString("hex")
    await prisma.session.create({

    data: {
        id: sessionId,
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION),
    },
    })

    res.cookie("sid", sessionId,{
        httpOnly: true,
        sameSite: "strict",
        maxAge: SESSION,
    })
    res.json({ ok: true})

})

router.post("/register",async (req, res) => {
    const { email, password} = req.body
    const existing = await prisma.user.findUnique({ where: {email}})
    if(existing){
        res.status(409).json({ message: "User already exists"})
        return
    }
    const hash = await argon2.hash(password)
    await prisma.user.create({ data: {email,password: hash}})
    res.json({ message: "User succesfully created"})
})

router.post("/logout", async (req,res) => {
    const sid = req.cookies?.sid
    if (sid) {
        await prisma.session.deleteMany({where: {id:sid}})
    }
    res.clearCookie("sid")
    res.json({ ok: true})
})

router.get("/me", async (req,res) => {
    const sid = req.cookies?.sid
    if (!sid) {
        res.status(401).json({ message: "Not authenticated"})
        return
    }

    const session = await prisma.session.findUnique({
        where: {id:sid},
        include: {user: true},
    })

    if (!session || session.expiresAt < new Date()) {
        res.clearCookie("sid")
        res.status(401).json({ message: "Session expired"})
        return
    }

    res.json({ id: session.user.id, email: session.user.email, role: session.user.role })
})

export default router
