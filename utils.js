require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');
const fs = require('fs');
const { URL } = require('url');

const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY;
const partnerTag = 'drsv00-20';
const region = 'us-east-1';
const service = 'ProductAdvertisingAPI';
const host = 'webservices.amazon.com.br';
const endpoint = `https://${host}/paapi5/getitems`;

const asin = 'B07FN1MZBH';

async function getAmazonProduct() {
  const payload = {
    ItemIds: [asin],
    Resources: [
      'Images.Primary.Medium',
      'ItemInfo.Title',
      'Offers.Listings.Price'
    ],
    PartnerTag: partnerTag,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.com.br'
  };

  const payloadJson = JSON.stringify(payload);
  const amzDate = moment.utc().format('YYYYMMDDTHHmmss') + 'Z';
  const dateStamp = moment.utc().format('YYYYMMDD');

  const canonicalUri = '/paapi5/getitems';
  const canonicalQuerystring = '';
  const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:application/json; charset=utf-8\nhost:${host}\nx-amz-date:${amzDate}\nx-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems\n`;
  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';
  const payloadHash = crypto.createHash('sha256').update(payloadJson, 'utf8').digest('hex');
  const canonicalRequest = `POST\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex')}`;

  function getSignatureKey(key, dateStamp, regionName, serviceName) {
    const kDate = crypto.createHmac('sha256', 'AWS4' + key).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    return kSigning;
  }

  const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers = {
    'Content-Encoding': 'amz-1.0',
    'Content-Type': 'application/json; charset=utf-8',
    'Host': host,
    'X-Amz-Date': amzDate,
    'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
    'Authorization': authorizationHeader
  };

  try {
    const response = await axios.post(endpoint, payloadJson, { headers });
    console.log('Response:', JSON.stringify(response.data));

    // save result into a file
    fs.writeFileSync('product_data.json', JSON.stringify(response.data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

function constructAffiliateLink(originalUrl, partnerTag) {
  // Parse the URL
  const parsedUrl = new URL(originalUrl);

  // For manual construction, you might want to extract the ASIN.
  // Assuming the URL contains the ASIN in the pathname like "/dp/B07FN1MZBH"
  const pathSegments = parsedUrl.pathname.split('/');
  const dpIndex = pathSegments.indexOf('dp');
  let asin = '';
  if (dpIndex !== -1 && pathSegments.length > dpIndex + 1) {
    asin = pathSegments[dpIndex + 1];
  }

  // Construct a new URL using only the ASIN and partner tag
  if (asin) {
    return `https://${parsedUrl.host}/dp/${asin}?tag=${partnerTag}`;
  } else {
    throw new Error('ASIN not found in URL.');
  }
}

// Example usage:
const originalLink = "https://www.amazon.com.br/Controle-Dualshock-PlayStation-4-Preto/dp/B07FN1MZBH/?_encoding=UTF8&pd_rd_w=rNp0Q&content-id=amzn1.sym.8fbb3d34-c3f1-46af-9d99-fd6986f6ec8f&pf_rd_p=8fbb3d34-c3f1-46af-9d99-fd6986f6ec8f&pf_rd_r=H1X6AGC20E415HYGYFHF&pd_rd_wg=hVsSp&pd_rd_r=8a5aacd3-780a-4a11-8f21-c9f7dccc2c2f&ref_=pd_hp_d_btf_crs_zg_bs_7791985011";
const affiliateLink = constructAffiliateLink(originalLink, 'drsv00-20');
console.log("Affiliate Link:", affiliateLink);

// getAmazonProduct();
// http://www.amazon.com/dp/ASIN/ref=nosim?tag=YOURASSOCIATEID