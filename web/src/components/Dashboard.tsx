import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Post = { id: string; title: string; content: string; createdAt: string }

export function Dashboard(){
    const navigate = useNavigate()
    const [posts, setPosts] = useState<Post[]>([])
    const [selected, setSelected] = useState<Post | null>(null)

    useEffect(() => {
        fetch("/api/posts/random", { credentials: "include" })
            .then(res => res.ok ? res.json() : [])
            .then(setPosts)
    }, [])

    async function handleLogout(){
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        })
        navigate("/login")
    }

return(
    <div className="h-screen flex flex-col bg-muted/40">
        <header className="border-b bg-background px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/posts")}>
                    My Posts
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                </Button>
            </div>
        </header>

        <main className="p-6 max-w-5xl w-full mx-auto">
            <Card className="">
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {posts.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No posts yet.</p>
                    ) : posts.map(post => (
                        <div key={post.id} className="flex items-start justify-between gap-4 cursor-pointer hover:bg-muted/50 rounded-md p-2 -mx-2 transition-colors" onClick={() => setSelected(post)}>
                            <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{post.title}</p>
                                <p className="text-muted-foreground text-sm truncate">{post.content.slice(0, 100)}{post.content.length > 100 ? "…" : ""}</p>
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </main>

        <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
            <DialogContent className="sm:max-w-lg flex flex-col max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="font-bold text-lg">{selected?.title}</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1">
                    <p className="text-sm whitespace-pre-wrap break-words">{selected?.content}</p>
                </div>
            </DialogContent>
        </Dialog>
    </div>
)

}
