import * as bcrypt from 'bcrypt';

// 加密密码
export async function hashPassword(password: string): Promise<string> {
	const saltRounds = 10; // 迭代次数，数值越高，计算时间越长
	const hashedPassword = await bcrypt.hash(password, saltRounds);
	return hashedPassword;
}

// 验证密码
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	const match = await bcrypt.compare(password, hashedPassword);
	return match;
}
