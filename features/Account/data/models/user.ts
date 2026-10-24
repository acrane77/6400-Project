import type { Role } from './roles';

export type User = {
    username: string;
    // firstName: string;
    // lastName: string;
    email: string;
    id: string;
    role?: Role;
}
