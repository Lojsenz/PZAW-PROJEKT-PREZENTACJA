import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Post = {
    id: string
    title: string
    content: string
    createdAt: string
}

export function Posts() {
    const navigate = useNavigate()
    const [posts, setPosts] = useState<Post[] | null>(null)
    const [open, setOpen] = useState(false)

    async function handleDelete(id: string) {
        await fetch(`/api/posts/${id}`, { method: "DELETE", credentials: "include" })
        setPosts(prev => prev?.filter(p => p.id !== id) ?? [])
    }
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")

    useEffect(() => {
        fetch("/api/posts", { credentials: "include" })
            .then(res => res.ok ? res.json() : [])
            .then(setPosts)
    }, [])

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
        navigate("/login")
    }

    async function handleCreate(e: React.SyntheticEvent) {
        e.preventDefault()
        const res = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title, content }),
        })
        if (res.ok) {
            const post = await res.json()
            setPosts(prev => [post, ...(prev ?? [])])
            setTitle("")
            setContent("")
            setOpen(false)
        }
    }

    return (
        <div className="min-h-screen bg-muted/40">
            <header className="border-b bg-background px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-semibold">My Posts</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                        Dashboard
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </header>

            <main className="p-6 max-w-3xl mx-auto space-y-4">
                {posts === null ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-5 w-1/3" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                        </Card>
                    ))
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                        <p className="text-lg font-medium">No posts yet</p>
                        <p className="text-sm text-muted-foreground">You haven't written anything. When you do, it'll show up here.</p>
                        <Button className="mt-2" onClick={() => setOpen(true)}>Create your first post</Button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-end">
                            <Button size="sm" onClick={() => setOpen(true)}>New Post</Button>
                        </div>
                        {posts.map((post) => (
                            <Card key={post.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{post.title}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </Badge>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2" onClick={() => handleDelete(post.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{post.content}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </>
                )}
            </main>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Create a post</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="flex flex-col gap-4 overflow-y-auto">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Post title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                placeholder="Write your post here..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="min-h-48 max-h-64 resize-none overflow-y-auto"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit">Publish</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
