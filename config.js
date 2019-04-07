//db connection
var dbUser = '';
var dbPass = ''; 
module.exports = { 
	'secret': ''
	, 'database': "mongodb://"+dbUser+":"+dbPass+".mlab.com:" // heavily redacted
}; // secret: used to create and verify JSON Web Tokens