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
]);
