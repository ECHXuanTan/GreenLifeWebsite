'use strict'
/**
 * VNPay Class implement refer from the VNPAY API v2.0 documentation.
 */
const moment = require('moment-timezone');
const Utils = require('./src/utils');
const SimpleSchema = require('simpl-schema');
const {promisify} = require('util');
const getIP = promisify(require('external-ip')());
const PayRequestValidator = require('./src/validators/requests/PayRequest');
const QueryRequestValidator = require('./src/validators/requests/QueryRequest');
const RefundRequestValidator = require('./src/validators/requests/RefundRequest');
const VNP_VERSION_DEFAULT = '2.0.0';
const CURRENCY_VND_CODE = 'VND';
const LOCALE_EN = 'en';
const LOCALE_VN = 'vn';
const DEFAUT_CREATEDATE_TIMEZONE = 'Asia/Ho_Chi_Minh';
const VNP_PAY_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNP_REFUND_URL = 'http://sandbox.vnpayment.vn/merchant_webapi/merchant.html';
const VNP_QUERY_URL = 'http://sandbox.vnpayment.vn/merchant_webapi/merchant.html';

class VNPay {
    constructor (config = {}) {
        this.config = {};
        this.configSchema = new SimpleSchema({
            secretKey: { type: String },
            merchantCode: { type: String, max: 8 },
            returnUrl: { type: String, min: 10, max: 255 },
            ipAddr: { type: String, optional: true, min: 7, max: 45 },
            locale: { type: String, optional: true, allowedValues: [LOCALE_EN, LOCALE_VN] },
            vnpVersion: { type: String, optional: true, allowedValues: ['1', VNP_VERSION_DEFAULT] },
            hashAlgorithm: { type: String, optional: true, allowedValues: ['sha256', 'md5'] },
            timezone: { type: String, optional: true }
        });
        this.setConfig(config);
        this.vnpDefaultParams = {
            vnp_Version: this.config.vnpVersion,
            vnp_CurrCode: CURRENCY_VND_CODE,
            vnp_TmnCode: this.config.merchantCode,
            vnp_Locale: this.config.locale,
            vnp_IpAddr: this.config.ipAddr
        }
    }

    setConfig (config = {}) {
        this.configSchema.validate(config)
        this.config = {
            vnpVersion: config.vnpVersion || VNP_VERSION_DEFAULT,
            locale: config.locale || LOCALE_VN,
            secretKey: config.secretKey,
            merchantCode: config.merchantCode,
            returnUrl: config.returnUrl,
            ipAddr: config.ipAddr,
            hashAlgorithm: config.hashAlgorithm ? config.hashAlgorithm.toLowerCase() : 'sha256',
            timezone: config.timezone || DEFAUT_CREATEDATE_TIMEZONE
        };
    }

    async genPayURL (payload) {
        PayRequestValidator.validate(payload);
        let merchantIpAddr;
        if (!this.config.ipAddr) {
            merchantIpAddr = await this.constructor.getPublicIP()
        } else {
            merchantIpAddr = this.config.ipAddr;
        }
        let createDate = this.genCreateDate()
        let expiredDate = createDate + 1500;
        let vnpParams = {
            ...this.vnpDefaultParams,
            vnp_Command: 'pay',
            vnp_ReturnUrl: this.config.returnUrl,
            vnp_TxnRef: payload.transactionRef,
            vnp_OrderInfo: payload.orderInfo,
            vnp_OrderType: payload.orderType,
            vnp_Amount: payload.amount * 100,
            vnp_CreateDate: createDate,
            vnp_ExpireDate: expiredDate,
            vnp_IpAddr: merchantIpAddr
        };
        
        if (payload.bankCode && payload.bankCode !== '') {
            vnpParams.vnp_BankCode = payload.bankCode;
        }
        vnpParams = Utils.genChecksumForParams(vnpParams, this.config.secretKey, 
            this.config.hashAlgorithm);
        // console.log('vnpParams', vnpParams)
        // return vnpParams;
        let urlParams = Utils.makeUrlParams(vnpParams);

        return `${VNP_PAY_URL}?${urlParams}`;
    }

    async genRefundURL (payload) {
        RefundRequestValidator.validate(payload);
        let merchantIpAddr;
        if (!this.config.ipAddr) {
            merchantIpAddr = await this.constructor.getPublicIP()
        } else {
            merchantIpAddr = this.config.ipAddr;
        }
        let vnpParams = {
            ...this.vnpDefaultParams,
            vnp_Command: 'refund',
            vnp_ReturnUrl: this.config.returnUrl,
            vnp_TransactionType: payload.transactionType,
            vnp_TxnRef: payload.transactionRef,
            vnp_Amount: payload.amount * 100,
            vnp_TransDate: payload.transDate,
            vnp_CreateDate: this.genCreateDate(),
            vnp_IpAddr: merchantIpAddr
        }
        if (payload.orderInfo && payload.orderInfo !== '') {
            vnpParams.vnp_OrderInfo = payload.orderInfo;
        }

        vnpParams = Utils.genChecksumForParams(vnpParams, this.config.secretKey, 
            this.config.hashAlgorithm);

        let urlParams = Utils.makeUrlParams(vnpParams);

        return `${VNP_REFUND_URL}?${urlParams}`;
    }

    async genQueryURL (payload) {
        QueryRequestValidator.validate(payload);
        let merchantIpAddr;
        if (!this.config.ipAddr) {
            merchantIpAddr = await this.constructor.getPublicIP()
        } else {
            merchantIpAddr = this.config.ipAddr;
        }
        let vnpParams = {
            ...this.vnpDefaultParams,
            vnp_Command: 'querydr',
            vnp_TxnRef: payload.transactionRef,
            vnp_OrderInfo: payload.orderInfo,
            vnp_TransDate: payload.transDate,
            vnp_OrderType: payload.orderType,
            vnp_CreateDate: this.genCreateDate(),
            vnp_IpAddr: merchantIpAddr
        }
        if (payload.transactionNo) {
            vnpParams.vnp_TransactionNo = payload.transactionNo;
        }

        vnpParams = Utils.genChecksumForParams(vnpParams, this.config.secretKey, 
            this.config.hashAlgorithm);
        let urlParams = Utils.makeUrlParams(vnpParams);

        return `${VNP_QUERY_URL}?${urlParams}`;
    }

    genCreateDate () {
        return parseInt(moment().tz(this.config.timezone).format('YYYYMMDDHHmmss'));
    }
    /**
     * Get the public IP Address of server. Refer https://github.com/sindresorhus/public-ip to set options
     * @param {Object} options 
     */
    static async getPublicIP (options = {}) {
        return getIP()
    }

    checkVNPayResponse (data) {
        return Utils.isValidResponse(data, this.config.secretKey);
    }

    convertResponseMessage (responseCode, locale = 'vn') {
        return Utils.getReturnUrlStatus(responseCode, locale || this.config.locale)
    }

}
module.exports = VNPay
