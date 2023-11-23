require('dotenv').config()
const https = require('https');
const querystring = require('querystring');

const postData = querystring.stringify({
  user: process.env['USERNAME'],
  password: process.env['PASSWORD']
});

const postOptions = {
  hostname: 'www.freecycle.org',
  port: 443,
  path: '/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9'
  },
}

const req = https.request(postOptions, (resp) => {
  const cookies: string[] = resp.headers["set-cookie"];
  const authCookie = cookies.find((cookie) => cookie.startsWith("MyFreecycle="))
    .split(';')[0]; // Get cookie key=value without metadata

  const getOptions = {
    hostname: 'www.freecycle.org',
    port: 443,
    path: resp.headers.location,
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
      'Cookie': authCookie
    },
  };

  if (resp.statusCode >= 300 && resp.statusCode < 400) {
    https.get(getOptions, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        console.log(data);
      });

    }).on('error', (err) => {
      console.log('Error: ' + err.message);
    });
  }

  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    console.log('Response Status Code:', resp.statusCode);
    console.log('Response Headers:', resp.headers);
    console.log(data);
  });

}).on('error', (err) => {
  console.error('Error: ' + err.message);
});

req.write(postData)
req.end()
