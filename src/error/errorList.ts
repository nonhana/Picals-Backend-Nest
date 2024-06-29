// src/error/errorList.ts
// 用于定义错误码和错误信息的映射关系（主动抛出异常hanaError）

export const errorMessages: Map<number, string> = new Map([
	// 通用错误
	[10001, 'Unknown Error'],
	[10002, 'Invalid options'],

	// 用户相关错误
	[10101, 'User not found'],
	[10102, 'User password error'],
	[10103, 'Email verification code error'],
	[10104, 'Invalid Email, Name, Password, or Verification Code Format'],
	[10105, 'User already exists'],
	[10106, 'Invalid token'],
	[10108, 'You have sent a verification code, please wait'],
	[10110, 'This user has already been followed'],
	[10111, 'This user can not been found as a followed user'],
	[10112, 'You can not follow yourself'],

	// 分页相关错误
	[10201, 'Page number must be greater than 0'],
	[10202, 'Page size must be greater than 0'],

	// 插画家相关错误
	[10301, 'Illustrator already exists'],

	// 标签相关错误
	[10401, 'This tag has already been liked'],
	[10402, 'This tag can not been found as a liked tag'],
	[10403, 'Tag is not found'],
	[10404, 'Invalid sort type'],

	// 插画相关错误
	[10501, 'Illustration not found'],
	[10502, "Can not edit other user's work"],
	[10503, 'This work has already been liked'],
	[10504, 'This work can not been found as a liked work'],
	[10505, 'This work has already been collected'],
	[10506, 'This work can not been found as a collected work'],

	// 收藏相关错误
	[10601, 'Favorite not found'],
	[10602, 'This work has already been added to the collection'],
	[10603, 'This work can not been found as a collected work'],

	// 评论相关错误
	[10701, 'Comment not found'],
	[10702, 'Can not delete other user’s comment'],

	// 历史记录相关错误
	[10801, 'History not found'],

	// 插画家相关错误
	[10901, 'Illustrator not found'],
	[10902, 'Illustrator already exists'],

	// 文件上传错误
	[11001, 'File upload failed'],
	[11002, 'File type is not supported'],
	[11003, 'File size exceeds the limit'],
	[11004, 'File not detected'],
]);
