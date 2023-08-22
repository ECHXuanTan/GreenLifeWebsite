import express from 'express';
import moment from 'moment';
import querystring from 'qs';
import crypto from 'crypto';
import cors from 'cors';

let router = express.Router();
router.use(cors());

// Add this before defining your routes
const enableCorsForVnpayRouter = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

router.use('/create_payment_url', enableCorsForVnpayRouter);
router.get('/create_payment_url', (req, res) => {
  let date = new Date();
  let createDate = moment(date).format('YYYYMMDDHHmmss'); 
  
  let ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
  
  let tmnCode = "J87CVZAU";
  let secretKey = "GIWEUTHSLDXKKCZSSHUCDZNRXUVUXZPV";
  let vnpUrl ="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  let returnUrl = req.query.returnUrl;
  let orderId = moment(date).format('DDHHmmss');
  let amount = req.query.amount *100;
  let bankCode ='';
  let locale = 'vn';
  let currCode = 'VND';
  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
  vnp_Params['vnp_OrderType'] = 'vn';
  vnp_Params['vnp_Amount'] = amount;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  if(bankCode !== null && bankCode !== ''){
      vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  // res.redirect(vnpUrl);
  res.json({url: vnpUrl});
});

function sortObject(obj) {
let sorted = {};
let str = [];
let key;
for (key in obj){
if (obj.hasOwnProperty(key)) {
str.push(encodeURIComponent(key));
}
}
str.sort();
for (key = 0; key < str.length; key++) {
  sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
}
return sorted;
}

export default router;