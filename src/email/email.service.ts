import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
	transporter: Transporter;

	constructor(private readonly configService: ConfigService) {
		this.transporter = createTransport({
			service: 'QQex',
			host: this.configService.get('NODEMAILER_HOST'),
			port: this.configService.get('NODEMAILER_PORT'),
			secure: true,
			auth: {
				user: this.configService.get('NODEMAILER_AUTH_USER'),
				pass: this.configService.get('NODEMAILER_AUTH_PASS'),
			},
		});
	}

	async sendEmail({ to, subject, html }) {
		return await this.transporter.sendMail({
			from: {
				name: this.configService.get('NODEMAILER_NAME'),
				address: this.configService.get('NODEMAILER_AUTH_USER'),
			},
			to,
			subject,
			html,
		});
	}
}
