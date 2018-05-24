module.exports = function(app){
	app.get('/', function (req, res){
		res.redirect('/home');
	});
	app.use('/home', require('./home'))
	app.use('/posts', require('./posts'))
	app.use('/signin', require('./signin'))
	app.use('/signout', require('./signout'))
	app.use('/signup', require('./signup'))
	app.use('/admin', require('./admin'))
	// 404 page
  	app.use(function (req, res) {
    	if (!res.headersSent) {
    		console.log(res.headersSent);
     	 res.status(404).render('404');
    	}
  	});
}