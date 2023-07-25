//GHTK


async function getShippingFeeGHTK(city, dis){
  const proxyUrl = 'http://localhost:3001/api/shipment/fee';


const requestBody = {
  pick_province: 'HCM city',
  pick_district: 'Quận 5',
  province: city,
  district: dis,
  address: '',
  weight: '',
  value: 0,
  transport: 'road',
  deliver_option: 'none',
  tags: [1]
};

const requestOptions = {
 // mode: 'no-cors',
  method: 'POST',
  headers: {
   // 'Token': token,
    'Host': 'services.giaohangtietkiem.vn',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    
  },
  body: JSON.stringify(requestBody)
};

try {
  const response = await fetch(proxyUrl, requestOptions);
  const data = await response.json();
  
  if (data.success && data.fee && data.fee.fee) {
    const fee = data.fee.fee;
    console.log("type of fee", typeof fee ,fee);
    return fee;
  } else {
    throw new Error('Invalid response format or missing data.');
  }
} catch (error) {
  console.error('Error fetching data:', error.message);
  return null;
}
}
  export default getShippingFeeGHTK;