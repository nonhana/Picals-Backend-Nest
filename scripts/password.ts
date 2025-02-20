import { hashPassword, verifyPassword } from '@/utils';

const [identifier, originalString] = process.argv.slice(2);

if (!identifier || !originalString) {
	console.error('Usage: ts-node scripts/password.ts <identifier> <originalString>');
	process.exit(1);
}

try {
	if (identifier === 'hash') {
		hashPassword(originalString).then((hashedPassword) => {
			console.log('Hashed password:', hashedPassword);
		});
	} else if (identifier === 'verify') {
		const hashedPassword = process.argv[3];
		verifyPassword(originalString, hashedPassword).then((isMatch) =>
			console.log('Password matches:', isMatch),
		);
	}
} catch (error) {
	console.error('Error:', error);
	process.exit(1);
}
