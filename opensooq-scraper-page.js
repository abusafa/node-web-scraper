import { argv } from 'optimist';
import {range} from 'lodash';

var fs      = require('fs');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient
import {ObjectId} from 'mongodb'
//var url = 'mongodb://localhost:27017/scraper';
var url = 'mongodb://abusafa:123@ds019063.mlab.com:19063/meteor';


let cats = [
 // "عقارات/شقق",
 // "عقارات/فلل-قصور",
 // "عقارات/غرف-للسكن",
 //  "عقارات/أبنية-تجارية",
 //  "عقارات/عمارات",
  // "عقارات/أراضي-مزارع",
  //"عقارات/شاليهات-مصايف-استراحات",
  "عقارات/عقارات-اخرى",
 //  "سيارات-ومركبات/سيارات-للبيع",
 //  "سيارات-ومركبات/سيارات-للإيجار",
//   "سيارات-ومركبات/دراجات-نارية ",
  // "موبايل-تابلت/موبايل",
 //  "موبايل-تابلت/تابلت",
 //  "موبايل-تابلت/اكسسوارات-موبايل-تابلت",
 //  "اجهزة-الكترونيات/لابتوب-كمبيوتر",
 //  "اجهزة-الكترونيات/تلفزيون-شاشات",
 //  "اجهزة-الكترونيات/كاميرات-تصوير",
 //  "اجهزة-الكترونيات/غسالات-ملابس-نشافات",
 //  "أثاث-ديكور/أثاث",
 //  "أثاث-ديكور/ديكور-المنزل-تأثيث",
 //  "أثاث-ديكور/ادوات-المطبخ-ضيافة",
 //  "أثاث-ديكور/أدوات-منزلية",
 //  "أثاث-ديكور/أثاث-ديكور-اخرى",
 //  "لوازم-الأطفال-و-الألعاب/اثاث-وغرف-نوم-اطفال",
//   "لوازم-الأطفال-و-الألعاب/عربات-ومقاعد-أطفال"
]



MongoClient.connect(url, function(err, db) {
  if(err) return ''

  var Posts = db.collection('posts');

  cats.map((cat)=>{
    console.log(cat)

    fs.readdir(`./public/temp/${cat}`, (err, files) => {
      if(err) return ''
      files.forEach(file => {
        //console.log(file);

        let content = fs.readFileSync(`./public/temp/${cat}/${file}`, "utf-8");
        var $ = cheerio.load(content);

        let details = $('.postDesc').text().replace(/\t/g, '')
        let images = []
        $('li[data-au="smallImg-AU"]').each(function(){
          images.push($(this).find('img').attr('src'));
          });

        let tags = []

        $('.customP ul li a').each(function(){
          tags.push($(this).text().trim());
        });




        let docId = file.split('.')[0]
        console.log(docId);
        console.log("------------------------------");
        Posts.update( { _id: ObjectId(docId) },
          { $set:
            {
              details: details,
              images:images
            },
            $push:{
              tags:{ $each: tags }
            }
          })



      });
    })

    return cat;

  })


})
