import COS from 'cos-nodejs-sdk-v5';

/**
 * 删除腾讯云COS中的文件
 * @param targetPath COS中的文件路径
 * @returns Promise<void>
 */
export const deleteFileFromCos = (targetPath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const cos = new COS({
			SecretId: process.env.COS_SECRETID!,
			SecretKey: process.env.COS_SECRETKEY!,
		});

		cos.deleteObject(
			{
				Bucket: process.env.COS_BUCKET!,
				Region: 'ap-shanghai',
				Key: targetPath,
			},
			(error) => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			},
		);
	});
};
