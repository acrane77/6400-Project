'use client'

import type { User } from "../../data/models/user";


interface UserListProps {
    users: User[];
    open: boolean;
    onClose: () => void;
}

export function UserListDialog({ users, open, onClose }: UserListProps) {
    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose()
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-list-dialog-title"
                className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 text-zinc-900 shadow-xl dark:bg-zinc-900 dark:text-zinc-100"
            >
                <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 id="user-list-dialog-title" className="text-xl font-semibold">Event attendees</h2>
                    <button
                        type="button"
                        aria-label="Close dialog"
                        onClick={onClose}
                        className="rounded-md p-2 text-2xl leading-none hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:bg-zinc-800"
                    >
                        ×
                    </button>
                </div>
                {users.length === 0 ? (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">No attendees have signed up yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {users.map((user) => (
                            <li key={user.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                                <p className="font-semibold">{user.username || 'Unnamed attendee'}</p>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}
