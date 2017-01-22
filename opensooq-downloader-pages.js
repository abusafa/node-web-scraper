// babel-node opensooq-downloader-pages.js --count 10 --cat عقارات/شقق

import { argv } from 'optimist';
import {range} from 'lodash';
import Queue from 'bee-queue';
var MongoClient = require('mongodb').MongoClient
//var url = 'mongodb://localhost:27017/scraper';
var url = 'mongodb://abusafa:123@ds019063.mlab.com:19063/meteor';
require('shelljs/global');
var mkdirp = require('mkdirp');

//var queue = new Queue('subtraction');
var queue = new Queue('subtraction', {
  redis: {
    host: '172.17.0.7'
  }
});

const {
  cat, count=1
} = argv;


let cats = [
	"عقارات/شقق",
	"عقارات/فلل-قصور",
	"عقارات/غرف-للسكن",
	"عقارات/أبنية-تجارية",
	"عقارات/عمارات",
	"عقارات/أراضي-مزارع",
	"عقارات/شاليهات-مصايف-استراحات",
	"عقارات/عقارات-اخرى",
	"سيارات-ومركبات/سيارات-للبيع",
	"سيارات-ومركبات/سيارات-للإيجار",
	"سيارات-ومركبات/دراجات-نارية ",
	"موبايل-تابلت/موبايل",
	"موبايل-تابلت/تابلت",
	"موبايل-تابلت/اكسسوارات-موبايل-تابلت",
	"اجهزة-الكترونيات/لابتوب-كمبيوتر",
	"اجهزة-الكترونيات/تلفزيون-شاشات",
	"اجهزة-الكترونيات/كاميرات-تصوير",
	"اجهزة-الكترونيات/غسالات-ملابس-نشافات",
	"أثاث-ديكور/أثاث",
	"أثاث-ديكور/ديكور-المنزل-تأثيث",
	"أثاث-ديكور/ادوات-المطبخ-ضيافة",
	"أثاث-ديكور/أدوات-منزلية",
	"أثاث-ديكور/أثاث-ديكور-اخرى",
	"لوازم-الأطفال-و-الألعاب/اثاث-وغرف-نوم-اطفال",
	"لوازم-الأطفال-و-الألعاب/عربات-ومقاعد-أطفال"
]


cats.map((categoty)=> mkdirp.sync(`./public/temp/${categoty}`))
  


MongoClient.connect(url, function(err, db) {

  var Posts = db.collection('posts');

	

  let urls = Posts.find({},{limit:count}).toArray(function(err, docs) {
    console.log(docs.length);
    docs.map((doc, key)=>{
      console.log(doc);
      queue.createJob(doc).save()
    })


  });
});



queue.process(function (job, done) {
	let j = `wget -q ${job.data.link} -O - | tr '\n' ' ' | grep -o '<div id="page">.*</div>' > ./public/temp/${job.data.cat}/${job.data._id}.html`
  console.log(j);
	setTimeout(()=>{
		exec(j, function(code, stdout, stderr) {
			console.log(code, stdout, stderr);
			done(null, job.data);
		})

	}, 500)
});
