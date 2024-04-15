import { HttpException, HttpStatus } from '@nestjs/common';
import { errorMessages } from './errorList';

class hanaError extends HttpException {
	constructor(code: number, message?: string) {
		super(
			{
				code,
				message: message || errorMessages.get(code) || 'Unknown Error',
			},
			HttpStatus.BAD_REQUEST,
		);
	}
}

export { hanaError };
