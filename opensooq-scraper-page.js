import { argv } from 'optimist';
import {range} from 'lodash';

var fs      = require('fs');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient
import {ObjectId} from 'mongodb'
var url = 'mongodb://localhost:27017/scraper';

const {
  cat
} = argv;


MongoClient.connect(url, function(err, db) {

  var Posts = db.collection('posts');

  fs.readdir(`./public/temp/${cat}`, (err, files) => {
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

})
