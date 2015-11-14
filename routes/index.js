var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var moment = require('moment');
require('moment-range');


var isAuthenticated = function (req, res, next) {
	
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}

module.exports = function(passport)
{

	
	router.get('/', function(req, res)
	{
		res.render('index', { message: req.flash('message') });
	});
	
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true  
	}));

	router.get('/signup', function(req, res)
	{
		res.render('register',{message: req.flash('message')});
	});


	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/',
		failureRedirect: '/signup',
		failureFlash : true  
	}));


	//---------------Date picker-------------------	
	router.post('/date_pick', function(req, res)
	{
		var home_json={};
		var title, release, link;
		var json_object = { title : "", link : "", date : ""};
		var data_array = [];
		var counter=0;
		var urls = ["http://localhost:3000/scrape/tech",
				"http://localhost:3000/scrape/sport",
				"http://localhost:3000/scrape/entertainment",
				"http://localhost:3000/scrape/travel",];
		
		var start = new Date(req.body.date1.substring(6,10),req.body.date1.substring(0,2),req.body.date1.substring(3,5));
		var end   = new Date(req.body.date2.substring(6,10),req.body.date2.substring(0,2),req.body.date2.substring(3,5));
		var range  = moment.range(start, end);
		
		for(var i = 0; i<urls.length; i++)	
		{
				request({
			    url: urls[i],
			    json: true
				}, function (error, response, body) {
				    if (!error && response.statusCode === 200) {
							
						for (i=0;i<body.scrape_obj.length;i++) 
						{
							var final_date = new Date(body.scrape_obj[i].date.substring(0,4),body.scrape_obj[i].date.substring(5,7),body.scrape_obj[i].date.substring(8,10));
							if(range.contains(final_date))
							{
								// console.log("coming...");
								data_array.push(body.scrape_obj[i]);
							}
						}

						
						counter++;
						if(counter==2)
						{
							function comp(b, a) {
				                return new Date(a.date).getTime() - new Date(b.date).getTime();
				            }

				            data_array.sort(comp);
				            var datei = data_array[0].date;
				            var datel = data_array[data_array.length-1].date;
							home_json = {'data_array':data_array};
							//res.render('home',{user:req.user,date1:req.date1,date2:req.date2});
							res.render('date_pick', { user: req.user, news:home_json,datei:datei,datel:datel})
							
						}

				    }
				    else
				    {
				    	res.send('Bad request');
				    }
				});
			
		}
	});


	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res)
	{

		
		var home_json={};
		var title, release, link;
		var json_object = { title : "", link : "", date : ""};
		var data_array = [];
		var counter=0;
		var urls = ["http://localhost:3000/scrape/tech",
				"http://localhost:3000/scrape/sport",
				"http://localhost:3000/scrape/entertainment",
				"http://localhost:3000/scrape/travel",];
		var choices = [req.user.tech,req.user.sport, req.user.entertainment,req.user.travel];

		//console.log();
		//putting all urls into loop to request and increasing the counter everytime some url provides the respont
		// at the end of the loop rendering the responses to home.

		for(var i = 0; i<urls.length; i++)
		{
			//console.log("here111  " + choices[i]);
			if(choices[i])
			{
				//console.log("url: " + urls[i]);	
				//console.log(urls[i]);
				request({
			    url: urls[i],
			    json: true
				}, function (error, response, body) {
				    if (!error && response.statusCode === 200) {
							
						//console.log("length: "+ body.scrape_obj.length);
						//putting all the objects in a new array to avoid the access problem
						for (i=0;i<body.scrape_obj.length;i++) 
						{
							data_array.push(body.scrape_obj[i]);
						}

						
						counter++;
						if(counter==2)
						{
							function comp(b, a) {
				                return new Date(a.date).getTime() - new Date(b.date).getTime();
				            }

				            data_array.sort(comp);
				            var datei = data_array[0].date;
				            var datel = data_array[data_array.length-1].date;
							home_json = {'data_array':data_array};
							res.render('home', { user: req.user, news:home_json,datei:datei,datel:datel})
							
						}

				    }
				    else
				    {
				    	res.send('Bad request');
				    }
				});
			}
		}


	});


	//--------get tech page---------------
	router.get('/tech', function(req, res)
	{

		 //var request = require("request")
		 //var categories = ['/tech', '/sports'];

		var url = "http://localhost:3000/scrape/tech";
		var jsnews = {};
		request({
			url: url,
			json: true
			}, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					//jsonobj[ct] = body;
					//console.log("tech; "+ body);
					res.render('tech', { user: req.user, news: body});
				}
				else
			 		res.send('Bad request');
			}
		);
		
		//res.json(jsonobj);
	});

	//---------------get sports page------------
	router.get('/sport', function(req, res)
	{
 
		var url = "http://localhost:3000/scrape/sport";
		var jsnews = {};
		request({
			url: url,
			json: true
			}, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					//jsonobj[ct] = body;
					res.render('sport', { user: req.user, news: body});
				}
				else
			 		res.send('Bad request');
			}
		);
		
	});


	//--------------get entertainment page-----------------
	router.get('/entertainment', function(req, res)
	{

		var request = require("request")
		//var categories = ['/tech', '/sports'];
		var url = "http://localhost:3000/scrape/entertainment";
		request({
			url: url,
			json: true
			}, function (error, response, body) {
				if (!error && response.statusCode === 200) {
	
					res.render('entertainment', { user: req.user, news: body});
				}
				else
			 		res.send('Bad request');
			}
		);
		
	});


	//-----------get travel page---------------
	router.get('/travel', function(req, res)
	{

		var request = require("request")
	
		var url = "http://localhost:3000/scrape/travel";
		var jsnews = {};
		request({
			url: url,
			json: true
			}, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					//jsonobj[ct] = body;
					res.render('travel', { user: req.user, news: body});
				}
				else
			 		res.send('Bad request');
			}
		);
		
	});


	/* Handle Logout */
	router.get('/signout', function(req, res)
	{
		req.logout();
		res.redirect('/');
	});

return router;
}

