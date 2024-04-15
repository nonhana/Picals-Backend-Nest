// src/error/errorList.ts
// 用于定义错误码和错误信息的映射关系（主动抛出异常hanaError）

export const errorMessages: Map<number, string> = new Map([
	// 用户相关错误
	[10101, 'User not found'],
	[10102, 'User password error'],
	[10103, 'Email verification code error'],
	[10104, 'Invalid Email, Name, Password, or Verification Code Format'],
	[10105, 'User already exists'],
	[10106, 'Invalid token'],
	[10107, 'Token expired, please log in again'],
	[10108, 'You have sent a verification code, please wait'],
	[10109, 'Invalid options'],

	// 分页相关错误
	[10201, 'Page number must be greater than 0'],
	[10202, 'Page size must be greater than 0'],

	// 插画家相关错误
	[10301, 'Illustrator already exists'],

	// 标签相关错误
	[10401, 'This tag has already been liked'],
	[10402, 'This tag can not been found as a liked tag'],
	[10403, 'Tag is not found'],
]);
