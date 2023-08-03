const NganLuong = require("../index");

let nganluong = new NganLuong({
  payment_gateway: "https://sandbox.nganluong.vn:8088/nl35/checkout.php",
  merchant_site_code: "47806",
  secure_pass: "bf461a3f91986e894ab8a19c0f400546"
});

let info_payment = {
  return_url: "http://localhost:3000/callback-payment",
  receiver: "nhayhoc@gmail.com",
  order_code: "daylaordercode",
  price: "10000",
  currency: "vnd",
  quantity: "1",
  tax: "0",
  discount: "0",
  fee_cal: "0",
  fee_shipping: "0",

  affiliate_code: "xx",
  buyer_info: "",
  order_description: "order_description",
  transaction_info: "transaction_info"
};
// let url_checkout = nganluong.buildCheckoutUrl(info_payment);
// console.log({ url_checkout });
let info_check_return = {
  transaction_info: "transaction_info",
  order_code: "daylaordercode",
  price: "10000",
  payment_id: "19682568",
  payment_type: "2",
  error_text: "",
  secure_code: "b5148c1764197b1702d26e90839320ba",
  token_nl: "142925-6409a18beb58ffbfd7351acd4a58ed92"
};
var check_payment = nganluong.verifyReturnUrl(info_check_return);
console.log({ check_payment });
