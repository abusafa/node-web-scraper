// babel-node opensooq-downloader-pages.js --count 10 --cat عقارات/شقق

import { argv } from 'optimist';
import {range} from 'lodash';
import Queue from 'bee-queue';
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/scraper';
require('shelljs/global');
var mkdirp = require('mkdirp');

var queue = new Queue('subtraction');

const {
  cat, count=1
} = argv;

mkdirp.sync(`./public/temp/${cat}`)

MongoClient.connect(url, function(err, db) {

  var Posts = db.collection('posts');

  let urls = Posts.find({cat:cat},{limit:count}).toArray(function(err, docs) {
    console.log(docs.length);
    docs.map((doc, key)=>{
      console.log(doc);
      queue.createJob(doc).save()
    })


  });
});



queue.process(function (job, done) {
	let j = `wget -q ${job.data.link} -O - | tr '\n' ' ' | grep -o '<div id="page">.*</div>' > ./public/temp/${cat}/${job.data._id}.html`
  console.log(j);
	setTimeout(()=>{
		exec(j, function(code, stdout, stderr) {
			console.log(code, stdout, stderr);
			done(null, job.data);
		})

	}, 500)
});
