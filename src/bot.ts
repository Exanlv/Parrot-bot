import { Client, Message } from 'discord.js';
import { CommandConfig } from './blueprints/CommandConfig';
import { CreateParrotCommand } from './commands/CreateParrotCommand';

export class Bot {

    /**
     * Prefix for commands of the bot
     * @todo configurable per server
     * @todo Tagging bot as prefix
     */
    public prefix: string;
    /**
     * The discord client the bot uses
     */
    private client: Client;

    /**
     * Bot token
     */
    private token: string;

    public constructor(token: string) {
        this.client = new Client();
        this.token = token;

        this.client.on('ready', () => {
            this.prefix = `<@!${this.client.user.id}>`
            this.registerMessageHandler();

            console.log('Bot started!');
        });

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
            if (message.content.startsWith(this.prefix)) {
                this.handleCommand(message);
            }
        });
    }

    /**
     * Handle a command used
     * @param message
     */
    private handleCommand(message: Message): void {
        const commandInstance = new CreateParrotCommand(message, this);

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
}
