'use client'

import type { User } from "../../data/models/user";
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'


interface UserListProps {
    users: User[];
    open: boolean;
    onClose: () => void;
}

export function UserListDialog({ users, open, onClose }: UserListProps) {
    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose()
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-list-dialog-title"
                className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xl"
            >
                <div className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                        <h2
                            id="user-list-dialog-title"
                            className="text-xl font-semibold"
                        >
                            Event attendees
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {users.length} registered attendees
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Close dialog"
                        onClick={onClose}
                        className="rounded-md text-muted-foreground"
                    >
                        <X className="size-5" />
                    </Button>
                </div>
                {users.length === 0 ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            No attendees have signed up yet.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-border">
                        {users.map((user) => (
                            <li key={user.id} className="py-4">
                                <p className="font-medium text-foreground">
                                    {user.username || 'Unnamed attendee'}
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {user.email}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}
