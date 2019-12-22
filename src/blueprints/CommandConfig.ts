import { PermissionLevel } from '../enums/PermissionLevel';

export class CommandConfig {
    /**
     * The trigger for the command after the prefix
     */
    public key: string;

    /**
     * The command class to be used
     */
    public command?: any;

    /**
     * Required permissions
     */
    public permission?: PermissionLevel;

    /**
     * Subcommands (--set rank, rank would be a sub command of set)
     */
    public subCommands?: CommandConfig[];

    /**
     * Whether the command is required to be run on a server
     */
    public requiresServer?: boolean;
}
