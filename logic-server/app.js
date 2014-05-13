var pomelo = require('pomelo');
var sync = require('pomelo-sync-plugin');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'logic-server');

//app configuration
app.configure('production|development', function() {
	app.loadConfig('mysql', app.getBase() + '/../share/config/mysql.json');
	
	var dbclient = require('./app/dao/mysql/mysql').init(app);
	app.set('dbclient', dbclient);

	app.use(sync, {
		sync : {
			path : __dirname + '/app/dao/mapping',
			dbclient : dbclient
		}
	});
});


//connector configuration
app.configure('production|development', 'connector', function() {
	app.set('connectorConfig', {
		connector : pomelo.connectors.hybridconnector,
		heartbeat : 3
	});
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
