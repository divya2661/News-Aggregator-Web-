var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport)
{

	passport.use('signup', new LocalStrategy
        ({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) 
        {

            findOrCreateUser = function()
            {
                //findOne pasport function
                User.findOne({ 'username' :  username }, function(err, user)
                {
                    
                    if (err)
                    {
                        console.log('Error in SignUp: '+err);
                        return done(err);
                    }
                    // check if user already exists
                    if (user)
                    {
                        console.log('User already exists with username: '+username);
                        return done(null, false, req.flash('message','User Already Exists'));
                    } 
                    else
                    {
                        
                        var newUser = new User();

                        // set the user's local credentials
                        newUser.username = username;
                        newUser.password = createHash(password);
                        newUser.sport = req.param('sport');
                        newUser.tech = req.param('tech');
                        newUser.entertainment = req.param('entertainment');
                        newUser.travel = req.param('travel');
                        newUser.email = req.param('email');
                        newUser.firstName = req.param('firstName');
                        newUser.lastName = req.param('lastName');
                       // console.log("user information of category:tech "+ newUser.tech + " sports: " + newUser.sport)


                        // save the user
                        newUser.save(function(err)
                        {
                            if (err)
                            {
                                console.log('Error in Saving user: '+err);  
                                throw err;  
                            }
                            console.log('User Registration succesful');    
                            return done(null, newUser,req.flash('message', 'User Registration succesful'));
                        });
                    }
                });
            };
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
        })
    );

    //password decryption
    var createHash = function(password)
    {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }

}