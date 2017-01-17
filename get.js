var https = require('https');



var options = {
  host: "10.27.0.12",
  port: 9999,
  path: "https://haraj.com.sa/jsonGW/getadsx.php?link=https://haraj.com.sa/tags/%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6_%D8%A7%D8%B1%D8%A7%D8%B6%D9%8A%20%D9%84%D9%84%D8%A8%D9%8A%D8%B9/5",
  headers: {
    Host: "haraj.com.sa"
  }
};
https.get(options, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);

  res.on('data', (d) => {
    process.stdout.write(d);
  });

}).on('error', (e) => {
  console.error(e);
});
