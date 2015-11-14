var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
	id: String,
	username: String,
	password: String,
	tech: Boolean,
	sport: Boolean,
	entertainment: Boolean,
	travel: Boolean,
	email: String,
	firstName: String,
	lastName: String

});
