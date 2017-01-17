var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
import {each, range} from 'lodash';
import Queue from 'bee-queue';
require('shelljs/global');
var MongoClient = require('mongodb').MongoClient
app.use(express.static('public'))
var url = 'mongodb://localhost:5001/meteor';


var locations=
[
	'الرياض',
	'جده',
	'مكه',
	'الشرقيه',
	'المدينة',
	'الطايف',
	'أبها',
	'القصيم',
	'تبوك',
	'حائل',
	'جيزان',
	'ينبع',
	'حفر الباطن',
	'نجران',
	'الباحة',
	'عرعر',
	'الجوف',
	'الإمارات',
	'الكويت',
	'البحرين',
	'قطر'
]







var cat = {
	'السيارات':
    [
		'تويوتا',
		'شيفروليهفورد',
		'قطع غيار وملحقات',
		'نيسان',
		'هونداي',
		'لكزس',
		'جي ام سي',
		'شاحنات ومعدات ثقيلة',
		'مرسيدس',
		'هوندا',
		'بي ام دبليو',
		'دبابات',
		'كيا',
		'دودج',
		'كرايزلر',
		'جيب',
		'ميتسوبيشي	',
		'مازدا',
		'لاند روفر',
		'ايسوزو',
		'كاديلاك',
		'بورش',
		'اودي',
		'سوزوكي',
		'انفنيتي',
		'همر',
		'لنكولن',
		'فولكس واجن',
		'ديهاتسو',
		'جيلي',
		'ميركوري',
		'فولفو',
		'بيجو',
		'بنتلي',
		'جاكوار',
		'سوبارو',
		'MG',
		'ZXAUTO',
		'رينو',
		'بيوك',
		'مازيراتي',
		'رولز رويس',
		'لامبورجيني',
		'اوبل',
		'سكودا',
		'فيراري',
		'سيتروين',
		'تشيري',
		'سيات',
		'دايو',
		'ساب',
		'فيات',
		'سانج يونج',
		'استون مارتن',
		'بروتون',
		'سيارات مصدومه',
		'سيارات للتنازل',
		'سيارات تراثية'
  ]
	,
	'العقار':
	[
		'اراضي للبيع',
		'شقق للايجار',
		'فلل للبيع',
		'شقق للبيع',
		'بيوت للبيع',
		'اراضي تجارية للبيع',
		'استراحات للايجار',
		'محلات للتقبيل ',
		'محلات للايجار',
		'عماره للايجار',
		'استراحات للبيع',
		'فلل للايجار',
		'مزارع للبيع',
		'ادوار للايجار',
		'بيوت للايجار'
	]
	,
	'الأجهزة':[],
}


var urlsList = []

locations.map((l)=>{
  cat.العقار.map((a)=>{
  	urlsList.push({
      url:'https://haraj.com.sa/jsonGW/getadsx.php?link=https://haraj.com.sa/tags/'+l+'_'+a+'/',
      location:l,
      cat:a
    })
  })
})


console.log('urlsList',urlsList);

var getData = function(url, Posts, Users, location, cat){
  request(url, (error, response, html)=>{
    console.log(error);
    if(!error){
      var $ = cheerio.load(html);

      var title, release, rating;
      var posts = [];
      var users = [];
      var json = {};

      $('.adx').filter(function(){
        var data = $(this);
        data.each(function(){
          var title = $(this).find('.adxTitle a').text().trim();
          var link = $(this).find('.adxTitle a').attr('href');
          var image = $(this).find('.adxImg img').attr('src');

          /*var location = $(this).find('.adxExtraInfoPart .fa-map-marker').parent().contents().filter(function() {
              return this.nodeType == 3;
          }).text().trim();*/
          var distirct =  $(this).find( ".adxInfo div:nth-child(3) div:nth-child(1) a" ).text().trim();

          var user = $(this).find('.adxExtraInfoPart .fa-user').parent().contents().filter(function() {
              return this.nodeType == 3;
          }).text().trim();

          posts.push({title:title, location:location, owner:user, link:link, image:image, cat:cat, distirct:distirct})
          users.push({username:user})
          Users.update(
             {username:user},
             {$set:{'longitude': '58.3', 'latitude': '0.3'}},
             { upsert: true}
          )
        });

      })


    }
    try{
      Posts.insertMany(
        posts
      , function(err, result) {
        console.log(err, result);
      });
    }
    catch(e){

    }


    /*Users.insertMany(
      users
    , function(err, result) {
      console.log(err, result);
    });*/

    /*fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');
    })*/

  });
}






MongoClient.connect(url, function(err, db) {
  console.log(err)
  console.log("Connected correctly to server");
  var Posts = db.collection('meta');
	var Raw = db.collection('raw');
  var Users = db.collection('users1');

  var webdata = [];
  app.get('/scrape', function(req, res){
    // Let's scrape Anchorman 2
    //https://haraj.com.sa/jsonGW/getadsx.php?link=tags/اراضي للبيع/500


    urlsList.map((o, index1)=>{
      range(499).map((item, index)=>{
        let url = `${o.url}${item}`;
        /*setTimeout(function() {
          console.log('url', url);
          getData(url, Posts, Users, o.location, o.cat);
        }, 500*(index1+1)*(index+1));
        */

        webdata.push({url:url, location:o.location, cat:o.cat})


      })
    })
    Posts.insertMany(webdata)
    console.log(webdata);



    res.send('Check your console!')

  })



  app.get('/test', function(req, res){

		var queue = new Queue('subtraction', {
	  redis: {
		    host: 'localhost',
				port: 6379
		  },
		  isWorker: true
		});

		let urls = Posts.find({},{}).toArray(function(err, docs) {
			console.log(docs.length);
			docs.map((doc, key)=>{
				queue.createJob(doc).save()
			})


		});

		queue.process(function (job, done) {
		  console.log('Processing job ' , job.data);
			setTimeout(()=>{
				exec(`wget ${encodeURI(job.data.url)} -O public/${job.data._id}.html`, function(code, stdout, stderr) {
					console.log(code, stdout, stderr);
					done(null, job.data.url);
				})

			}, 500)
		  //return done(null, job.data.x + job.data.y);
		});
    res.send('test!')

  })




	app.get('/insert', function(req, res){

		const testFolder = './public/';

		fs.readdir(testFolder, (err, files) => {
		  files.forEach(file => {
		    console.log(file);
				getData(`http://localhost:8081/${file}`, Raw, Users, file.split('.')[0], '');
		  });
		})
		res.send('insert!')

	})


});
app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;
