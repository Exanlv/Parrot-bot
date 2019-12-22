import { Emoji, Message, MessageReaction, RichEmbed, User } from 'discord.js';
import { EventEmitter } from 'events';
import { PermissionLevel } from '../enums/PermissionLevel';
import { Bot } from '../bot';

export abstract class Command extends EventEmitter {

    /**
     * The message send by the user triggering the command
     */
    public message: Message;

    /**
     * Client of bot
     */
    public bot: Bot;

    /**
     * Permission level of user
     */
    public userPermission: PermissionLevel;

    public constructor(message: Message, bot: Bot) {
        super();

        this.message = message;
        this.bot = bot;
    }

    /**
     * Send a message in the channel the command was used
     * @param message The message to be send
     */
    protected async sendMessage(message: string|RichEmbed): Promise<Message> {
        try {
            return await this.message.channel.send(message) as Message;
        } catch (e) {
            this.reportError(e);
        }
    }

    /**
     * Report an error
     * @param e the error to be reported
     */
    protected reportError(e: any): void {
        this.emit('error', e, this.message);
    }

    /**
	 * Ask user for input with reacts
	 * @param message The message that should be send
	 * @param reacts The reacts that are allowed / have a value
	 * @param values The return value for each reaction
	 */
    protected async reactInput(message: string|RichEmbed, reacts: Array<string|Emoji>, values: any[], deleteMessage: boolean = true): Promise<any> {
        const discordMessage = await this.sendMessage(message);

        const allowed = reacts.map((e: string|Emoji) => typeof e === 'string' ? e : e.id);

        /**
		 * Janky way to make sure the reacts are done in the correct order while
		 * still being async allowing the code to move on
		 */
        let reactCount = 0;

        const reactNext = async (): Promise<void> => {
            reactCount++;

            while (reactCount < reacts.length) {
                try {
                    await discordMessage.react(reacts[reactCount]);
                } catch (e) { return; }

                reactCount++;
            }
        };

        discordMessage.react(reacts[reactCount]).then(reactNext);

        const reactUsed = (await discordMessage.awaitReactions(
            (e: MessageReaction, u: User) => allowed.includes(e.emoji.id || e.emoji.name) && u.id === this.message.author.id,
            {max: 1, time: 30000},
        )).first();

        if (deleteMessage) {
            discordMessage.delete();
        }

        if (!reactUsed) {
            return;
        }

        for (const i in reacts) {
            if ((typeof reacts[i] === 'string' && reacts[i] === reactUsed.emoji.name) || ((reacts[i] as Emoji).id === reactUsed.emoji.id)) {
                return values[i];
            }
        }
    }

    protected getInput(trim: boolean = true): {[key: string]: string} {
        let input = this.message.cleanContent.split(' ');
        let output: {[key: string]: string} = {};

        input.forEach((arg) => {
            const matchRes = arg.match(/^(.{1,}):(.{1,})$/);

            if (matchRes) {
                output[matchRes[1]] = matchRes[2].trim();
            }
        });

        return output;
	}
}
