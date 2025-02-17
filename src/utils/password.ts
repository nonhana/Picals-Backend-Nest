import * as argon2 from 'argon2';

// 加密密码
export async function hashPassword(password: string): Promise<string> {
	return await argon2.hash(password);
}

// 验证密码
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	return await argon2.verify(hashedPassword, password);
}
