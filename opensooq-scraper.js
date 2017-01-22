import { argv } from 'optimist';
import {range} from 'lodash';

var fs      = require('fs');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient
//var url = 'mongodb://localhost:27017/scraper';
var url = 'mongodb://abusafa:123@ds019063.mlab.com:19063/meteor';

const {
  cat
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

MongoClient.connect(url, function(err, db) {

  var Posts = db.collection('posts');

	cats.map((o)=>{
		console.log(o)
		fs.readdir(`./public/${o}`, (err, files) => {
    files.forEach(file => {
      //console.log(file);

      let content = fs.readFileSync(`./public/${cat}/${file}`, "utf-8");
      var $ = cheerio.load(content);

      $('.rectLi').filter(function(){
        var data = $(this);

        data.each(function(){
          let d = $(this).find('a[data-role="chat-opener"]');
          let title = d.attr('data-post-title');
          let person = d.attr('data-recipient-name');
          let pid = d.attr('data-pid');
          let price = d.attr('data-price');
          let image = d.attr('data-post-img');
          let link = 'https://jo.opensooq.com' + d.attr('data-post-href');



          let location = $(this).find( "ul.rectCatesLinks li:nth-child(1)" ).text()

          let tags = [];
          tags.push(location)
          $(this).find('.rectCatesLinks a').each(function(){
            tags.push($(this).text());
          });

          Posts.insert({cat,title,pid,person,price, link,images:[image],location, tags})

        })
      });

    });
  })

		return o;
	})

  


  //MongoClient.close();
  //process.exit()


})
