import express from "express"
import authRouter from "./routes/auth"
import adminRouter from "./routes/admin"
import postsRouter from "./routes/posts"
import cookieParser from "cookie-parser"
const app = express()
const PORT = 3000


app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/admin", adminRouter)
app.use("/api/posts", postsRouter)

app.get("/health", (req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})
