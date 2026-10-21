'use client';

import type { Role } from '@/features/Account/data/models/roles';

type RoleSelectorProps = {
    role: Role;
    onRoleChange: (role: Role) => void;
};

// Will be used by organizers to change roles of people involved in the event.

export default function RoleSelector({ role, onRoleChange }: RoleSelectorProps) {
    return (
        <select
            value={role}
            onChange={(event) => onRoleChange(event.target.value as Role)}
            className="rounded-lg border-2 p-2"
        >
            <option value="ORGANIZER">Organizer</option>
            <option value="VOLUNTEER">Volunteer</option>
            <option value="PARTICIPANT">Participant</option>
        </select>
    );
}
