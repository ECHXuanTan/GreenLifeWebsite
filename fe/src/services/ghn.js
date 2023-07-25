 //GHN
 async function getShippingFeeGHN() {
  const url = 'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee';
  const token = 'd9e1558e-2975-11ee-b394-8ac29577e80e';

  const requestBody = {
    from_district_id:1454,
    from_ward_code:"21211",
    service_id:53320,
    service_type_id:null,
    to_district_id:1452,
    to_ward_code:"21012",
    height:50,
    length:20,
    weight:200,
    width:20,
    insurance_value:10000,
    cod_failed_amount:2000,
    coupon: null
  };

  const requestOptions = {
   // mode: 'no-cors',
    method: 'POST',
    headers: {
      'Token': token,
      'ShopID': '4382110',
      'Content-Type': 'application/json',
      
    },
    body: JSON.stringify(requestBody)
  };

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    console.log('API Response:', data);
    if (data.data && data.data.service_fee) {
      console.log("Service Fee:", data.data.service_fee);
      return data.data.service_fee;
    } else {
      throw new Error('Invalid response format or missing data.');
    }
  
  } catch (error) {
    console.error('Error fetching data:', error.message);
    return null;
  }
}

