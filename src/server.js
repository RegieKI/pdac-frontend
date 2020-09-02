import sirv from 'sirv'
import compression from 'compression'
import * as sapper from '@sapper/server'

import temp from 'pi-temperature'
import nodeDiskInfo from 'node-disk-info'
// import gpioButtons from 'rpi-gpio-buttons'


import axios from 'axios'
import { AutoSetup } from './server/API.js'
import os from 'os'
import wifi from './../pi-wifi';

import fs from 'fs'
import DirectusSDK from "@directus/sdk-js"


import kill  from 'tree-kill'
import { exec, spawn } from 'child_process'
import ON_DEATH from 'death'

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const directus = new DirectusSDK({
  url: "https://api.sinnott.cc/",
  project: "pdac"
});

console.log(`----------------------------------------> mode: ${process.env.NODE_ENV}`);

const isDev = (process.env.NODE_ENV == 'development')

let browser, backend;

// if (!isDev) {


axios.get('http://localhost:8888').then( res => {
	console.log('[server.js] 🥚  backend is running! not starting.')
}).catch( err => {
	

	backend = spawn('sh', ['/home/pi/pdac/runBackend.sh']);
	console.log('[server.js] 🥚  spawning runBackend.sh >>>>>', backend.pid );

	backend.stdout.pipe(process.stdout)
	backend.on('exit', function() {
		console.log('[server.js] ⚰️ backend has exited');
		exec('sh /home/pi/pdac/killNode.sh');
		process.exit();
	})

	setTimeout( function() { 
		browser = spawn('sh', ['/home/pi/pdac/launchBrowser.sh']);
		console.log('[server.js] 🥚  spawning launchBrowser.sh >>>>>', browser.pid );
	}, 10000)

})

// }


// import GPIO from 'rpi-gpio'
// 16 + 26 or 36 + 37
// GND is 39
/*
console.log('[server.js] 📍 attempting pins...');
GPIO.setup(36, GPIO.DIR_HIGH, function(err) {
	if (err) throw err;
  GPIO.write(36, true, function(err) {
	      if (err) console.error('[server.js] 📍 PIN 36: error', err);
      console.log('[server.js] 📍 PIN 36: written to pin');
  });
});
GPIO.setup(37, GPIO.DIR_HIGH, function(err) {
	if (err) throw err;
	let onoff = true;
  console.log('[server.js] 📍 PIN 37: setting loop...');
	setInterval( function() {
		onoff = !onoff;
	  GPIO.write(37, onoff, function(err) {
	      if (err) console.error('[server.js] 📍 PIN 37: error', err);
	  });
	}, 2);
});
*/


// library uses physical ordering of pins!

// gpioButtons( [18, 16, 12] ).on('clicked', function(pin) {

// 	if (pin == 12) {
// 		console.log('[server.js] 🔘  TOP button pressed', pin);

// 	} else if (pin == 16) {
// 		console.log('[server.js] 🔘  MIDDLE button pressed', pin);

// 	} else if (pin == 18) {
// 		console.log('[server.js] 🔘  BOTTOM button pressed', pin);

// 	}
// });

// ON_DEATH(function(signal, err) {
// 	if (!isDev) {
// 		console.log('[server.js] ☠️  exiting  ☠️')
// 	}
// })

AutoSetup(
	{
		SessionByID: async ( req, res, params ) => {
			return (await directus.getItems( 'session', {
					"filter[url][eq]": params.session,
					"fields": "*,exercises.exercise_id.*,exercises.exercise_id.tags.tag_id.*,exercises.exercise_id.example.*"
				}
			)).data;
		},
		SessionsList: async ( req, res, params ) => {
			return (await directus.getItems( 'session', {
					"filter[status][eq]": "published",
					"fields": "*,exercises.exercise_id.*,exercises.exercise_id.tags.tag_id.*"
				}
			)).data;
		},
		ParticipantsList: async( req, res, params ) => {
			return (await directus.getItems( 'participant', {
					"fields": "*"
				}
			)).data;
		},
		Execute: async(req, res, params ) => {
			return new Promise( (resolve, reject ) => {
				exec( req.body.command, function( err, out, code ) {
					if (err) return reject( err );
					return resolve(out);
				})
			});
		},
		SetHostname: async(req, res, params ) => {
			return new Promise( (resolve, reject ) => {
				const cmd = `sh /home/pi/pdac/setHostname.sh ${req.body.hostname}`;
				console.log('[SetHostname] 🔖  setting with: ', cmd);
				const r = exec(cmd);
				resolve({});
			});
		},
		SystemReboot: async(req, res, params ) => {
			return new Promise( (resolve, reject ) => {
				exec('sh /home/pi/pdac/rebootNow.sh');
				resolve({});
			});
		},
		SystemShutdown: async(req, res, params ) => {
			return new Promise( (resolve, reject ) => {
				exec('sh /home/pi/pdac/shutdownNow.sh');
				resolve({});
			});
		},
		CalibrateScreen: async(req, res, params ) => {
			return new Promise( (resolve, reject ) => {
				exec('sh /home/pi/pdac/calibrateScreen.sh');
				resolve({});
			});
		},
		Info: async ( req, res, params ) => {

			return new Promise( (resolve, reject) => {


				function getInfo( resolve, reject, backend ) {
					nodeDiskInfo.getDiskInfo().then( drives => {
						wifi.status( 'wlan0', function(err, status) {
							if (err) return reject(err);

							temp.measure(function(err2, temperature) {
									if (err2) return reject(err2);
									return resolve( {
										hostname: os.hostname(),
										type: os.type(),
										platform: os.platform(),
										totalmem: os.totalmem(),
										freemem: os.freemem(),
										usedmem: os.totalmem() - os.freemem(),
										uptime: os.uptime(),
										wlan0: status || {},
										drives,
										backend,
										temperature
									} );
							});
						});
					});
				}

				const miPath = '/home/pi/pdac/usb/miband.txt'

				fs.readFile( miPath, "utf8", (err, data) => {
							console.log('[Info] ✅  read miband.txt...', data);
						const mac_address = (err) ? 'UNKNOWN' : data.replace(/(\r\n|\n|\r)/gm, "").trim();
						axios.get('http://localhost:8888/status').then( res => {
							console.log('[Info] ✅  success: backend connected...', Object.keys(res), res.data);
							return getInfo( resolve, reject, { ...res.data, mac_address, active: true } );
						}).catch( err => {
							console.log('[Info] ❌  error: backend not connected...', Object.keys(err));
							return getInfo( resolve, reject, { mac_address, active: false } );
						});
				});
			})

		},
		SetMibandAddress: async ( req, res, params ) => {
			return new Promise( (resolve, reject) => {
				console.log('[SetMibandAddress] setting...', req.body.mac_address);
				fs.writeFile( '/home/pi/pdac/usb/miband.txt', req.body.mac_address, (err) => {
					if (err) return reject(err);
					return resolve({});
				});
			})
		}, 
		NetworkList: async ( req, res, params ) => {
			return new Promise( (resolve, reject) => {
				wifi.scan(function(err, data) {
					if (err) return reject(err);
					return resolve( data );
				});
			})
		}, 
		ConnectToNetwork: async( req, res, params ) => {

			return new Promise( (resolve, reject) => {
				const ssid = req.body.ssid;
				const password = req.body.psk;
				const o = {ssid, password};
				console.log(`[ConnectToNetwork] 🗝 `, o	);

				wifi.connectTo(o, function(err) {
					wifi.restartInterface( 'wlan0', function(err) {
						setTimeout( function() { 
							wifi.status( 'wlan0', function(err, status) {

								if (err) {
									console.log('[ConnectToNetwork:status] ❌🗝  error:', err.message, Object.keys(err) );
									return reject(err);
								}
								if (!status.ssid) {
									return reject({message: 'No SSID'})
								}
								console.log(`[ConnectToNetwork] ✅🗝  success:` );
								return resolve(status);
							});
						}, 1000 * 10);
					});
				});
			}) 
		},
		NetworkUSB: async( req, res, params ) => {

			return new Promise( (resolve, reject) => {
				const wlanPath = '/home/pi/pdac/usb/wlan.txt';
				console.log(`[NetworkUSB] 🌐  getting:`, wlanPath );
				if ( fs.existsSync( wlanPath ) ) {
					fs.readFile( wlanPath, "utf8", (err, data) => {
						if (err) {
							console.log(`[NetworkUSB] 🌐❌  couldn't open` );
							return reject(err);
						}
						const d = data.split('\n');
						console.log(`[NetworkUSB] 🌐✅ wlan`, d );
						return resolve( { ssid: d[0], psk: d[1] } );
					});
				} else {
					console.log(`[NetworkUSB] 🌐  no file` );
					return resolve( {} );
				}
			});
		},
		SystemRestart: async(req, res, params) => {

			return new Promise( (resolve, reject) => {

				exec('sh /home/pi/pdac/killAll.sh & sh /home/pi/pdac/run.sh');
				
				return resolve({});
			});
		},
		Buzz: async(req, res, params) => {
			return new Promise( (resolve, reject) => {
					const seq = req.body.sequence || '200 200 10 0.001';
					exec(`/usr/bin/python /home/pi/pdac/buzz.py ${seq}`);
					resolve({});
			});
		},
		CameraStart: async(req, res, params) => {
			return new Promise( (resolve, reject) => {
				console.log('[CameraStart] sending config:', req.body);
				axios.post( 'http://localhost:8888/start/', req.body ).then( res => {
					console.log('[CameraStart] 📸 ✅  successfully started')
					//50 50 3 0.00008
					if (req.body.buzz) exec(`/usr/bin/python /home/pi/pdac/buzz.py ${req.body.buzz}`);
					return resolve(res.data);
				}).catch( err => {
					if (err.response) {
						let t = '';
						if (err.response.status) t += err.response.status;
						if (err.response.statusText) t += ': '+err.response.statusText;
						if (err.response.data) t += ': '+err.response.data;
						console.log('[CameraStart] ❌ error', t)
						reject(t);
					} else {
						console.log('[CameraStart] ❌ error', err.toString())
						reject(err);
					}
				});

			});
		},
		MibandConnect: async(req, res, params) => {
			return new Promise( (resolve, reject) => {
				console.log('[MibandConnect] starting...');
				axios.post( 'http://localhost:8888/bleconnect/', {} ).then( res => {
					console.log('[MibandConnect] 📸 ✅  successfully connected')
					return resolve(res.data);

				}).catch( err => {
					if (err.response) {

						// TODO 1

						let t = '';
						if (err.response.status) t += err.response.status;
						if (err.response.statusText) t += ': '+err.response.statusText;
						if (err.response.data) t += ': '+err.response.data;
						console.log('[MibandConnect] ❌ error', t)
						reject(t);
					} else {
						console.log('[MibandConnect] ❌ error', err.toString())
						reject(err);
					}
				});

			});
		},
		CameraStop: async(req, res, params) => {
			return new Promise( (resolve, reject) => {
				console.log('[CameraStop] sending stop...');
				axios.post( 'http://localhost:8888/stop/', req.body ).then( res => {
					console.log('[CameraStop] 📸 🛑  successfully stopped')
					exec('/usr/bin/python /home/pi/pdac/buzz.py 50 50 30 0.0001')
					return resolve(res.data);
				}).catch( err => {

						// TODO 2
						
					if (err.response) {
						let t = '';
						if (err.response.status) t += err.response.status;
						if (err.response.statusText) t += ': '+err.response.statusText;
						if (err.response.data) t += ': '+err.response.data;
						console.log('[CameraStop] ❌ error', t)
						reject(t);
					} else {
						console.log('[CameraStop] ❌ error', err.toString())
						reject(err);
					}
				});

			});
		},
		Debug: async( req, res, params ) => {
			return new Promise( (resolve, reject) => {
				console.log('[server.js] 🎉  DEBUG:', JSON.stringify(req.body, null, 2)); 
			}) 
		}
	}, { 
		'/usb': {
			GET: 'files:/home/pi/pdac/usb'
		},
		'/info': { 
			GET: 'Info'
		},
		'/network': {
			GET: 'NetworkUSB'
		},
		'/network/list': {
			GET: 'NetworkList'
		},
		'/network/connect': {
			POST: 'ConnectToNetwork'
		},
		'/session': {
			GET: 'SessionsList'
		},
		'/session/:session': {
			GET: 'SessionByID'
		},
		'/session/:session/exercise': {
			GET: 'SessionByID'
		},
		'/session/:session/exercise/:exercise': {
			GET: 'SessionByID'
		},
		'/camera/start': {
			POST: 'CameraStart'
		},
		'/camera/stop': {
			POST: 'CameraStop'
		},
		'/system/reboot': {
			GET: 'SystemReboot'
		},
		'/system/shutdown': {
			GET: 'SystemShutdown'
		},
		'/system/restart': {
			GET: 'SystemRestart'
		},
		'/system/calibrate': {
			GET: 'CalibrateScreen'
		},
		'/system/hostname': {
			GET: 'ParticipantsList',
			POST: 'SetHostname'
		},
		'/system/miband/reconnect': {
			POST: 'MibandConnect'
		},
		'/system/miband': {
			POST: 'SetMibandAddress'
		},
		'/debug': {
			POST: 'Debug'
		},
		'/execute': {
			POST: 'Execute'
		},
		'/buzz': {
			POST: 'Buzz'
		}
	})
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware()
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});

