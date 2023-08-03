'use strict'
const querystring = require('qs');

class Utils {
    static  hash (data, algorithm = 'sha256') {
        let encryptor = require(algorithm);
        return encryptor(data);
    }

    static sortObject (obj) {
        let sorted = {};
        let keys = [];

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        keys.sort();
        let keysLength = keys.length;
        for (let i = 0; i < keysLength; i++) {
            sorted[keys[i]] = obj[keys[i]];
        }
        
        return sorted;
    }
    
    static genChecksumForParams (params, secretKey, algorithm = 'sha256') {
        let secureHash = this.genChecksum(params, secretKey, algorithm);
        params.vnp_SecureHashType = algorithm.toUpperCase();
        params.vnp_SecureHash = secureHash;

        return params;
    }

    static genChecksum (params, secretKey, algorithm = 'sha256') {
        params = this.sortObject(params);
        let signData = secretKey + querystring.stringify(params, { encode: false });
        return this.hash(signData, algorithm)
    }

    static isValidResponse (data, secretKey) {
        let vnpSecureHash = data.vnp_SecureHash;
        let vnpSecureHashType = data.vnp_SecureHashType ? data.vnp_SecureHashType.toLowerCase() : 'sha256';
        delete data.vnp_SecureHash;
        delete data.vnp_SecureHashType;
        let checkSum = this.genChecksum(data, secretKey, vnpSecureHashType);
        console.log('vnp_hash', vnpSecureHash)
        console.log('checksum', checkSum);
        return checkSum === vnpSecureHash;
    }

    static remakeOrderInfo (orderInfo) {
        return orderInfo.split(' ').join('+');
    }

    static getMerchantIpAddr (request) {
        let ipAddr = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        request.connection.socket.remoteAddress;

        return ipAddr;
    }

    static makeUrlParams (params) {
        return querystring.stringify(params, { encode: true });
    }

    static getReturnUrlStatus(responseCode, locale = 'vn') {
		const responseCodeTable = {
			'00': {
				vn: 'Giao dịch thành công',
				en: 'Approved',
			},
			'01': {
				vn: 'Giao dịch đã tồn tại',
				en: 'Transaction is already exist',
			},
			'02': {
				vn: 'Merchant không hợp lệ (kiểm tra lại vnp_TmnCode)',
				en: 'Invalid merchant (check vnp_TmnCode value)',
			},
			'03': {
				vn: 'Dữ liệu gửi sang không đúng định dạng',
				en: 'Sent data is not in the right format',
			},
			'04': {
				vn: 'Khởi tạo GD không thành công do Website đang bị tạm khóa',
				en: 'Payment website is not available',
			},
			'05': {
				vn:
					'Giao dịch không thành công do: Quý khách nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
				en: 'Transaction failed: Too many wrong password input',
			},
			'06': {
				vn:
					'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
				en: 'Transaction failed: Wrong OTP input',
			},
			'07': {
				vn:
					'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường). Đối với giao dịch này cần merchant xác nhận thông qua merchant admin: Từ chối/Đồng ý giao dịch',
				en: 'This transaction is suspicious',
			},
			'08': {
				vn:
					'Giao dịch không thành công do: Hệ thống Ngân hàng đang bảo trì. Xin quý khách tạm thời không thực hiện giao dịch bằng thẻ/tài khoản của Ngân hàng này.',
				en:
					'Transaction failed: The banking system is under maintenance. Please do not temporarily make transactions by card / account of this Bank.',
			},
			'09': {
				vn:
					'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
				en: 'Transaction failed: Cards / accounts of customer who has not yet registered for Internet Banking service.',
			},
			10: {
				vn: 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
				en: 'Transaction failed: Customer incorrectly validate the card / account information more than 3 times',
			},
			11: {
				vn: 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
				en: 'Transaction failed: Pending payment is expired. Please try again.',
			},
			24: {
				vn: 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
				en: 'Transaction canceled',
			},
			51: {
				vn: 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
				en: 'Transaction failed: Your account is not enough balance to make the transaction.',
			},
			65: {
				vn: 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
				en: 'Transaction failed: Your account has exceeded the daily limit.',
			},
			75: {
				vn: 'Ngân hàng thanh toán đang bảo trì',
				en: 'Banking system is under maintenance',
			},
			default: {
				vn: 'Giao dịch thất bại',
				en: 'Failured',
			},
		};

		const respondText = responseCodeTable[responseCode];

		return respondText ? respondText[locale] : responseCodeTable.default[locale];
	}
}
module.exports = Utils;
