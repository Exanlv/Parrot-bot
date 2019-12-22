import { CommandConfig } from '../blueprints/CommandConfig';
import { PermissionLevel } from '../enums/PermissionLevel';
import { HelpCommand } from './public/HelpCommand';

export const commandConfig: CommandConfig[] = [
    {
        key: 'test',
        subCommands: [
            {
                key: 'help',
                command: HelpCommand,
                permission: PermissionLevel.public,
                requiresServer: true
            },
        ],
    },
];
