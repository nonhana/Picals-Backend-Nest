import COS from 'cos-nodejs-sdk-v5';
import fs from 'fs';

/**
 * 上传单个文件至腾讯云COS
 * @param filePath 本地文件路径
 * @param targetPath 目标路径
 * @returns Promise<string> 返回上传成功的文件URL
 */
export const uploadFileToCos = (filePath: string, targetPath: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		const cos = new COS({
			SecretId: process.env.COS_SECRETID!,
			SecretKey: process.env.COS_SECRETKEY!,
		});

		cos.putObject(
			{
				Bucket: process.env.COS_BUCKET!, // 必须
				Region: 'ap-shanghai', // 必须
				Key: targetPath, // 必须
				Body: fs.createReadStream(filePath), // 必须
				ContentLength: fs.statSync(filePath).size,
			},
			(error, data) => {
				if (error) {
					reject(error);
				} else {
					resolve('https://' + data.Location);
					// 成功上传后删除本地文件
					fs.unlinkSync(filePath);
				}
			},
		);
	});
};
