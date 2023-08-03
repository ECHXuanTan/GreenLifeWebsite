# node-vnpay
Support for generate URL payment of VNPAY
## Installation
```js
    npm i --save node-vnpay
```
## Usage
To use this package, you must register merchant or merchant test account on vnpayment.vn website.
You will receive an merchant Code and Secure Secret Key. Save them and continue....
### Generate pay url for a payment
```js
    const VNPay = require('node-vnpay')
    let vnpay = new VNPay({
        secretKey: 'YOUR_VNPAY_SECRET_KEY',
        returnUrl: 'YOUR_RETURN_URL_TO_RECEIVE_RESPONSE',
        merchantCode: 'YOUR_MERCHANT_CODE',
        hashAlgorithm: 'sha256' // optional 
    });
    // require pay 10000 VND.
    let payURL = await vnpay.genPayURL({
        transactionRef: 'PT20200520103101_007',
        orderInfo: 'Thanh toan hoa don dich vu',
        orderType: '100000',
        amount: 100000,
        bankCode: 'NCB'
    })
```
