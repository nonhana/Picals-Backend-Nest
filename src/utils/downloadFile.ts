import axios from 'axios';

/**
 * 从 url 下载文件，返回二进制数据
 * @param url - 文件的 URL
 * @returns 文件的二进制数据
 */
export const downloadFile = async (url: string): Promise<Buffer> => {
	const response = await axios.get(url, { responseType: 'arraybuffer' });
	return response.data;
};
