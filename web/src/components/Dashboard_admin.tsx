import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type Post = { id: string; title: string; content: string; createdAt: string }
type User = { id: string; email: string; role: string }

export function DashboardAdmin(){
    const navigate = useNavigate()
    const [stats, setStats] = useState<{ totalUsers: number; totalPosts: number; uptime: string } | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    const [selected, setSelected] = useState<Post | null>(null)
    const [usersOpen, setUsersOpen] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [search, setSearch] = useState("")
    const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState<Record<string, boolean>>({})

    async function handleDelete(id: string) {
        await fetch(`/api/admin/posts/${id}`, { method: "DELETE", credentials: "include" })
        setPosts(prev => prev.filter(p => p.id !== id))
    }

    async function openUsers() {
        setUsersOpen(true)
        const res = await fetch("/api/admin/users", { credentials: "include" })
        const data: User[] = await res.json()
        setUsers(data)
        setPendingRoles(Object.fromEntries(data.map(u => [u.id, u.role])))
    }

    async function saveRole(userId: string) {
        setSaving(prev => ({ ...prev, [userId]: true }))
        await fetch(`/api/admin/users/${userId}/role`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: pendingRoles[userId] }),
        })
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: pendingRoles[userId]! } : u))
        setSaving(prev => ({ ...prev, [userId]: false }))
    }

    const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()))

    useEffect(() => {
        fetch("/api/admin/stats", { credentials: "include" })
            .then(res => res.json())
            .then(setStats)
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

        <main className="p-6 max-w-5xl w-full mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:bg-muted/60 transition-colors" onClick={openUsers}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats?.totalUsers ?? "—"}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats?.totalPosts ?? "—"}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats?.uptime ?? "—"}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="">
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {posts.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No posts yet.</p>
                    ) : posts.map(post => (
                        <div key={post.id} className="flex items-start justify-between gap-4 rounded-md p-2 -mx-2">
                            <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setSelected(post)}>
                                <p className="font-medium text-sm truncate">{post.title}</p>
                                <p className="text-muted-foreground text-sm truncate">{post.content.slice(0, 100)}{post.content.length > 100 ? "…" : ""}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="secondary">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </Badge>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2" onClick={() => handleDelete(post.id)}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </main>

        <Dialog open={usersOpen} onOpenChange={setUsersOpen}>
            <DialogContent className="sm:max-w-lg flex flex-col max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Users</DialogTitle>
                </DialogHeader>
                <Input
                    placeholder="Search by email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="mt-1"
                />
                <div className="overflow-y-auto flex-1 space-y-2 mt-2">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
                            <span className="flex-1 text-sm truncate">{user.email}</span>
                            <select
                                value={pendingRoles[user.id] ?? user.role}
                                onChange={e => setPendingRoles(prev => ({ ...prev, [user.id]: e.target.value }))}
                                className="text-sm border rounded-md px-2 py-1 bg-background"
                            >
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                            </select>
                            <Button
                                size="sm"
                                disabled={saving[user.id] || pendingRoles[user.id] === user.role}
                                onClick={() => saveRole(user.id)}
                            >
                                {saving[user.id] ? "Saving…" : "Save"}
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>

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
