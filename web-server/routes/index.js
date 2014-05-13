var path = 'javascripts/lib/dojo-1.9.3/';

exports.index = function(req, res) {
	res.render('index', {
		dojoPath : path + 'dojo/dojo.js',
		cssPath : path + 'dijit/themes/claro/claro.css'
	});
};

