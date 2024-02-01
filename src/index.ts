const https = require('https');
const fs = require('fs');
import { parse } from 'node-html-parser';
const searchData = require('../search.json');

const searchTown = searchData['searchTown'];
const searchItem = searchData['searchItem'].toLowerCase();

const options = {
  hostname: 'www.freecycle.org',
  port: 443,
  path: `/town/${searchTown}`,
  method: 'GET',
}

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const root = parse(data)
    const fcData = JSON.parse(root.querySelector('fc-data').attributes[':data']);

    let posts = {};

    fcData['posts'].forEach(post => {
      if (post['type']['name'] === 'OFFER') {
        if (!searchItem) {
          posts[post['id']] = {
            'Item' : post['subject'],
            'Description' : post['description']
          }
        } else {
          if (post['subject'].toLowerCase().includes(searchItem)) {
            posts[post['id']] = {
              'Item' : post['subject'],
              'Description' : post['description']
            }
          }
        }
      }
    });

    console.log(posts);

    const jsonString = JSON.stringify(fcData, null, 2);

    fs.writeFile('./fc-data.json', jsonString, err => {
      if (err) {
          console.log('Error writing file', err)
      } else {
          console.log('Successfully wrote file')
      }
    });
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end()





// Code below unused: session cookie is no longer accessible due to hhtponly flag

/*

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
  console.log(resp);
  console.log(resp.headers);
  console.log(resp.statusCode);

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

*/
