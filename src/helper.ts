import { GuildMember, User } from 'discord.js';
import { PermissionLevel } from './enums/PermissionLevel';

/**
 * Whether a member has a certain permission
 * @param member
 * @param permission
 */
export function hasPermission(member: User|GuildMember, permission: PermissionLevel): boolean {
    switch (permission) {
        case PermissionLevel.public:
            return true;

        case PermissionLevel.admin:
            return member instanceof GuildMember && member.hasPermission('ADMINISTRATOR');

        case PermissionLevel.dev:
            return process.env.DEV.includes(member.id);
    }
}

/**
 * Gets the permission level of a user
 * @param member member to get the permission level of
 */
export function getPermissionLevel(member: User|GuildMember): PermissionLevel {
    if (hasPermission(member, PermissionLevel.dev)) {
        return PermissionLevel.dev;
    }

    if (hasPermission(member, PermissionLevel.admin)) {
        return PermissionLevel.dev;
    }

    if (hasPermission(member, PermissionLevel.public)) {
        return PermissionLevel.dev;
    }
}
