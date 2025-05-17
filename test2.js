require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');
const fs = require('fs');

const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY;
const partnerTag = 'drsv00-20';
const region = 'us-east-1';
const service = 'ProductAdvertisingAPI';
const host = 'webservices.amazon.com';
const endpoint = `https://${host}/paapi5/searchitems`;

async function searchAmazonProducts(keyword) {
  const payload = {
    Keywords: keyword,
    SearchIndex: 'All', // You can specify 'Books', 'Electronics', etc.
    ItemCount: 5,
    PartnerTag: partnerTag,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.com.br',
    Resources: [
      'Images.Primary.Medium',
      'Images.Primary.Large',
      'ItemInfo.Title',
      'ItemInfo.TradeInInfo',
      'ItemInfo.Features',
      'ItemInfo.ManufactureInfo',
      'ItemInfo.ByLineInfo',
      'ItemInfo.Classifications',
      'ItemInfo.ProductInfo',
      'ItemInfo.ContentInfo',
      'ItemInfo.ContentRating',
      'ItemInfo.TechnicalInfo',
      'ItemInfo.ExternalIds',
      'Offers.Listings.Price',
      'Offers.Listings.MerchantInfo',
      'Offers.Listings.SavingBasis',
      'Offers.Listings.Promotions',
      'Offers.Summaries.HighestPrice',
      'Offers.Summaries.LowestPrice',
      'Offers.Summaries.OfferCount',
      'BrowseNodeInfo.BrowseNodes',
      'BrowseNodeInfo.BrowseNodes.Ancestor',
      'BrowseNodeInfo.BrowseNodes.SalesRank',
      'BrowseNodeInfo.WebsiteSalesRank',
      'ParentASIN',
    ]
  };

  const payloadJson = JSON.stringify(payload);
  const amzDate = moment.utc().format('YYYYMMDDTHHmmss') + 'Z';
  const dateStamp = moment.utc().format('YYYYMMDD');

  const canonicalUri = '/paapi5/searchitems';
  const canonicalQuerystring = '';
  const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:application/json; charset=utf-8\nhost:${host}\nx-amz-date:${amzDate}\nx-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems\n`;
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
    'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
    'Authorization': authorizationHeader
  };

  try {
    const response = await axios.post(endpoint, payloadJson, { headers });
    console.log('Response:', JSON.stringify(response.data, null, 2));
    fs.writeFileSync('search_results.json', JSON.stringify(response.data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

searchAmazonProducts('B0CB528ZCG');
