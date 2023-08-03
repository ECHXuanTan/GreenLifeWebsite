# ngan-luong-2x

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

Thư viện hỗi trợ xây dựng URL thanh toán cho cổng thanh toán trực tuyến ngân lượng phiên bản 2x

- So với phiên bản 3x, phiên bản 2x có giao diện lựa chọn các phương thức/ngân hàng thanh toán.
- Tạo link redirect thanh toán
- Nhận kết quả trả về theo return_url
- Kiểm tra trạng thái đơn hàng

### Cài đặt

```sh
# npm
npm install ngan-luong-2x --save
# yarn
yarn add ngan-luong-2x
```

### Tài liệu tích hợp

Bạn nên đọc trước tài liệu tích hợp từ cổng thanh toán [link pdf](https://www.dropbox.com/s/855xrzuoyp499lr/NL_checkout_v2.0_vn.pdf)

### Hướng dẫn

1. Require class hỗi trợ

```sh
const NganLuong = require("ngan-luong-2x");
```

2. Khởi tạo với thông tin từ cổng thanh toán

```javascript
const nganluong = new NganLuong({
  isSandbox: true,
  merchant_site_code: "47806",
  secure_pass: "bf461a3f91986e894ab8a19c0f400546"
});
```

3. Tạo url redirect qua cổng thanh toán

```javascript
var url = nganluong.buildCheckoutUrl({
  return_url: "http://localhost:3000/callback-payment",
  affiliate_code: "",
  buyer_info: "",
  currency: "vnd",
  discount: "0",
  fee_cal: "0",
  fee_shipping: "0",
  order_code: "laskjflkasjj8o3jflkdsjv",
  order_description: "dayladonhang est",
  price: "10000",
  quantity: "1",
  receiver: "nhayhoc@gmail.com",
  tax: "0",
  transaction_info: "day_la_thong_tin_giao_dich"
});
console.log({ url });
/*
{ url:
   'https://sandbox.nganluong.vn:8088/nl35/checkout.php?merchant_site_code=47806&return_url=http://localhost:3000/callback-payment&currency=vnd&discount=0&fee_cal=0&fee_shipping=0&order_code=laskjflkasjj8o3jflkdsjv&order_description=day%20la%20don%20hang%20test&price=10000&quantity=1&receiver=nhayhoc@gmail.com&tax=0&transaction_info=day%20la%20thong%20tin%20giao%20dich&secure_code=fc6f861d1fbc89599ac0491fbdba2ced' }
 */
```

4. Kiểm tra và xác thực thanh toán quan url callback

```javascript
var result_callback = nganluong.verifyReturnUrl({
  error_text: "",
  price: "10000",
  payment_id: "19682770",
  transaction_info: "day_la_thong_tin_giao_dich",
  order_code: "laskjflkasjj8o3jflkdsjv",
  payment_type: "2",
  secure_code: "25a50fe5ef428e35addbbbafbe13dc40",
  token_nl: "142989-8caae7fc844cc12a2328dc057aca43be"
});
console.log(result_callback);
/*
{ isSuccess: true,
  payment_id: '19682770',
  error_text: '',
  order_code: 'laskjflkasjj8o3jflkdsjv',
  token_nl: '142989-8caae7fc844cc12a2328dc057aca43be' }
*/
```

nếu `check_payment.isSuccess` === `true` thì thanh toán thành công

5. Kiểm tra trạng thái đơn hàng

```javascript
nganluong
  .checkOrderStatus("laskjflkasjj8o3jflkdsjv")
  .then(data => console.log(data))
  .catch(err => console.error(err));
/*
{ message: 'Giao dịch thành công',
  error_code: '00',
  data:
   { token: '142989-8caae7fc844cc12a2328dc057aca43be',
        ....
     transaction_id: 19682770,
     payment_type: 2,
     transaction_status: '00' } }
*/
```

## License

MIT

**Đức đẹp trai**
