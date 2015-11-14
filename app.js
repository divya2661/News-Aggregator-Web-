var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs'); 
var request = require('request');
var cheerio = require('cheerio');
var dbConfig = require('./db'); 
var mongoose = require('mongoose');
mongoose.connect(dbConfig.url);

var app = express();

//Scrapping th data from cnn.com

app.get('/scrape/:cat', function(req, res){
    
    url = 'http://edition.cnn.com/';
    //req.param.cat --> gets from the client side according to the requirement
    category = req.params.cat;
    var jsobj = {}; //
    var scrape_obj = [];

    //request url to get the data
    request(url + category, function(error, response, html){
        if(!error)
        {

           // console.log("server url: " + url);
            var $ = cheerio.load(html);
            var title, release, link;
            //json object to save the data.
            var json = { title : "", link : "", date : ""};
            // cd_headline-tet is the unique class in  articles of cnn.com so used it to scrape
            // used inspect element for it
            $('.cd__headline-text').filter(function()
            {

                //getting the data of this class
                var data = $(this);

                //getting the title of the news
                title = data.text();

                link = data.parent().attr('href');

                //some  href were starting from '/' and were using the given url so change the links
                if(link[0]=="/")
                {
                    var new_url = "http://edition.cnn.com"
                    link = new_url+link;
                }

                //date was also given in the links so to extract the date from those
                //used link similarity to get the date as every link was having the dates just 
                //after finishing the url.

                var sublink = link.substring(7,link.length);
                var index_slash = sublink.indexOf("/");
                var date = sublink.substring(index_slash+1,index_slash+11);
                //console.log("date: "+date);
                var num  = sublink.substring(index_slash+1,index_slash+5);
                    
                //some links were having videos only in so checked the url date numbers to extract the date

                if(!isNaN(num))
                {
                    json.title = title;
                    json.link = link;

                    //changes the date format 
                    var new_date = date.substring(0,4) + '-' + date.substring(5,7)+'-' + date.substring(8,10);
                    //console.log("date: " + new_date)
                    json.date = new_date;
                    scrape_obj.push({title: title,link:link,date:new_date});
                }

                // Once we have our title, we'll store it to the our json object.
            });
        }

            //sorted our array by dates
            function comp(b, a)
            {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            }

            scrape_obj.sort(comp);

            //put the array in json object
            jsobj = {'scrape_obj': scrape_obj};
                
            //converting JSON 
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(jsobj));
            // res.redirect('/home');
     });
});

// }


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Passport configuration
var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());


var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

var routes = require('./routes/index')(passport);
app.use('/', routes);

// error handler
app.use(function(req, res, next) 
{
    //console.log("here");
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


if (app.get('env') === 'development') 
{
    app.use(function(err, req, res, next)
    {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

module.exports = app;
