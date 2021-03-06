import { Command } from '../blueprints/Command';
import { IRunnableCommand } from '../interfaces/IRunnableCommand';
import { createParrot } from 'party-parrots';
import { Attachment } from 'discord.js';

export class CreateParrotCommand extends Command implements IRunnableCommand {
    public async run(): Promise<void> {

		if (this.message.content.includes('privacy')) {
			this.sendMessage('Parrot does not log or store anything longer than required for the application to function. This bot is hosted on a Scaleway VPS. Their privacy policy may apply.');
			return;
		}

        if (this.message.attachments.size === 0) {
            this.sendMessage('Attach an image to get a parrot.');
            return;
        }

        const input = this.getInput();
		const speed = input.speed ? Number(input.speed) : 4.75;
		

        this.message.attachments.tap(async (attachment) => {
            try {
                const buffer = (await createParrot(attachment.url, speed)).gif.buffer;
                this.message.channel.send(undefined, new Attachment(buffer, 'parrot.gif'));
            } catch (e) {
                this.sendMessage('Invalid file');
                return;
            }
        });
    }
}
