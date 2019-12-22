import { Client, Message } from 'discord.js';
import { CommandConfig } from './blueprints/CommandConfig';
import { commandConfig } from './commands/config';
import { MissingPermissionCommand } from './commands/MissingPermissionCommand';
import { RequiresServerCommand } from './commands/RequiresServerCommand';
import { UnknownCommand } from './commands/UnknownCommand';
import { getPermissionLevel, hasPermission } from './helper';

export class Bot {

    /**
     * Prefix for commands of the bot
     * @todo configurable per server
     * @todo Tagging bot as prefix
     */
    public static prefix: string = '--';
    /**
     * The discord client the bot uses
     */
    private client: Client;

    /**
     * Bot token
     */
    private token: string;

    /**
     * Commands of the bot
     */
    private commands: CommandConfig[];

    public constructor(token: string) {
        this.client = new Client();
        this.token = token;

        this.commands = commandConfig;

        this.client.on('ready', () => {
            console.log('Bot started!');
        });

        this.registerMessageHandler();
    }

    /**
     * Logs the bot in
     */
    public login(): void {
        this.client.login(this.token);
    }

    /**
     * Register what needs to happen when the bot receives a message
     */
    private registerMessageHandler(): void {
        this.client.on('message', (message: Message) => {
            if (message.content.startsWith(Bot.prefix)) {
                this.handleCommand(message);
            }
        });
    }

    /**
     * Handle a command used
     * @param message
     */
    private handleCommand(message: Message): void {
        const command = message.content.substr(Bot.prefix.length).split(' ');

        /**
         * Remove empty entries in case someone types 2 spaces
         */
        for (let i = command.length - 1; i > -1; i--) {
            if (command[i] === '') {
                command.splice(i, 1);
            }
        }

        const commandConfig = this.getCommandConfig(command);

        /**
         * Determine whether the user can use this command
         */
        let commandClass;
        if (commandConfig && commandConfig.command) {
            if (commandConfig.requiresServer && !message.guild) {
                commandClass = RequiresServerCommand;
            } else {
                commandClass = hasPermission(message.member || message.author, commandConfig.permission) ? commandConfig.command : MissingPermissionCommand;
            }
        } else {
            commandClass = UnknownCommand;
        }

        const commandInstance = new commandClass(message, this.client, getPermissionLevel(message.member));

        commandInstance.run().catch(async (e: any): Promise<void> => {
            /**
             * Bot might not have permission to send messages in channel,
             * if it failed for this reason, it'll fail here once again
             */
            try {
                await message.channel.send(`\`\`\`${e}\`\`\``);
            } catch (e) {
                /**
                 * Reporting the error didnt work, bot appears to be missing
                 * permission to send messages, notify guild owner (todo)
                 */
            }
        });
    }

    /**
     * Get the command config associated with a command by a user
     * @param userCommand
     * @param availableCommands
     */
    private getCommandConfig(userCommand: string[], availableCommands?: CommandConfig[]): CommandConfig {
        availableCommands = availableCommands || this.commands;

        const usedCommand = availableCommands.find((c: CommandConfig) => c.key === userCommand[0]);

        if (usedCommand && usedCommand.subCommands && userCommand.length > 1) {
            return this.getCommandConfig(userCommand.slice(1), usedCommand.subCommands);
        }

        return usedCommand;
    }
}
