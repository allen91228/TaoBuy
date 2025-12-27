import { UserButton } from "@clerk/nextjs"

interface AdminHeaderProps {
  user: {
    name: string | null
    email: string
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {user.name || user.email}
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}

