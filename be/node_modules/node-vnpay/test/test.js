const assert = require('assert');
const defaultConfig = require('./config.json');
const VNPay = require('../index');
const extIP = require('external-ip')();

let vnpay = new VNPay({
    secretKey: defaultConfig.secretKey,
    returnUrl: defaultConfig.returnUrl,
    merchantCode: defaultConfig.merchantCode,
    hashAlgorithm: 'sha256'
});
console.log('genCreateDate', vnpay.genCreateDate());

describe('Generate VNPAY URL for API pay', async () => {
    let payURL = await vnpay.genPayURL({
        transactionRef: 'PT20200520103101_007',
        orderInfo: 'Thanh toan hoa don dich vu',
        orderType: 'topup',
        amount: 100000,
        bankCode: 'NCB'
    })
    console.log('payURL', payURL)
})
console.log('    ')

describe('Generate VNPAY URL for API refund', async () => {
    let refundURL = await vnpay.genRefundURL({
        transactionType: '02',
        transactionRef: 'PT20200520103101_008',
        transDate: 20200520114301,
        orderInfo: 'Tra lai tien KH (kh tra lai hang)',
        amount: 100000
    })
    console.log('refundURL', refundURL);
})
console.log('    ')
describe('Generate VNPAY URL for API truy van giao dich', async () => {
    let queryURL = await vnpay.genQueryURL({
        transactionRef: 'PT20200520103101_007',
        orderType: '250006',
        transDate: 20200520104301,
        orderInfo: 'Kiem tra ket qua giao dich',
    })
    console.log('queryURL', queryURL);
})

describe('Test response', () => {
    let responseData = {
        vnp_Amount: 1000000,
        vnp_BankCode: 'NCB',
        vnp_BankTranNo: '20200521-162954',
        vnp_CardType: 'ATM',
        vnp_OrderInfo: 'Thanh toan don hang thoi gian: 2020-05-21 16:05:42',
        vnp_PayDate: 20200521162945,
        vnp_ResponseCode: '00',
        vnp_TmnCode: '1SNJ89L8',
        vnp_TransactionNo: '13304053',
        vnp_TransactionStatus: '00',
        vnp_TxnRef: '160529',
        vnp_SecureHashType: 'SHA256',
        vnp_SecureHash: '8cd9d2efe8d67a39bdc1272540acfe712f610d5e154fa57dc83c6d0854d30c58'
    };
    console.log('is Valid response ', vnpay.checkVNPayResponse(responseData))
    console.log('Message: ' + vnpay.convertResponseMessage(responseData.vnp_ResponseCode))
})