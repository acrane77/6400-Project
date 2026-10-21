'use client';

import { useState } from 'react';
import type { Role } from '../../features/Account/data/models/roles'

export default function rbacTest() {

    const [role, setRole] = useState<Role>('PARTICIPANT');

    return(
        <div className="p-6">
            <h1>RBAC Testing</h1>

            <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
            >
                <option value="DEVELOPER">Developer</option>
                <option value="ORGANIZER">Organizer</option>
                <option value="VOLUNTEER">Volunteer</option>
                <option value="PARTICIPANT">Participant</option>
            </select>
        </div>
    )





}
