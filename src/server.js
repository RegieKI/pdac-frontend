import sirv from 'sirv';
import compression from 'compression';
import * as sapper from '@sapper/server';

import temp from 'pi-temperature'
import nodeDiskInfo from 'node-disk-info'

import axios from 'axios'
import { AutoSetup } from './server/API.js'
import os from 'os'
import wifi from './../pi-wifi';

import fs from 'fs'
import DirectusSDK from "@directus/sdk-js"; 

import {exec} from 'child_process'


const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const directus = new DirectusSDK({
  url: "https://api.sinnott.cc/",
  project: "pdac"
}); 




import {wpa} from './../wireless-tools';

AutoSetup(
	{
		SessionByID: async ( req, res, params ) => {
			return (await directus.getItems( 'session', {
					"filter[url][eq]": params.session,
					"fields": "*,exercises.exercise_id.*,exercises.exercise_id.tags.tag_id.*"
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
		SetHostname: async(req, res, params ) => {
			return new Promise( (resolve, reject ) => {
				fs.writeFile('/etc/hostname', params.hostname, function (err) {
				  if (err) return reject(err);
				  return resolve();
				});
			});
		},
		Reboot: async(req, res, params ) => {
			return new Promise( (resolve, reject ) => {
				exec('sudo reboot now', function (msg) { 
					console.log('[server] rebooting: ', msg) 
				});
			});
		},
		Shutdown: async(req, res, params ) => {
			return new Promise( (resolve, reject ) => {
				exec('sudo shutdown now', function (msg) { 
					console.log('[server] shutting down: ', msg) 
				});
			});
		},
		Statistics: async(req, res, params ) => {
			return new Promise( (resolve, reject ) => {

				// get temp: /opt/vc/bin/vcgencmd measure_temp
				resolve();
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

				axios.get('http://localhost:8888/status').then( res => {
					console.log('[Info] ✅  success: backend connected...', Object.keys(res), res.data);
					return getInfo( resolve, reject, res.data );
				}).catch( err => {
					console.log('[Info] ❌  error: backend not connected...', Object.keys(err));
					return getInfo( resolve, reject, {} );
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
					if (err) {
						console.log('[ConnectToNetwork:connectTo] ❌🗝  error:', err );
						return reject(err);
					}


					wifi.restartInterface( 'wlan0', function(err) {
						if (err) {
							console.log('[ConnectToNetwork:restartInterface] ❌🗝  error:', err );
							return reject(err);
						}
						wifi.status( 'wlan0', function(err, status) {

							if (err) {
								console.log('[ConnectToNetwork:status] ❌🗝  error:', err );
								return reject(err);
							}
							console.log(`[ConnectToNetwork] ✅🗝  success:` );
							return resolve(status);
						});
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
		Start: async(req, res, params) => {
			return new Promise( (resolve, reject) => {
				console.log('[Start] sending config:', req.body);
				axios.post( 'http://localhost:8888/start/', req.body ).then( res => {
					console.log('[Start] 📸 ✅  successfully started')
					resolve(res.data);
				}).catch( err => {
					if (err.response) {
						let t = '';
						if (err.response.status) t += err.response.status;
						if (err.response.statusText) t += ': '+err.response.statusText;
						if (err.response.data) t += ': '+err.response.data;
						console.log('[Start] ❌ error', t)
						reject(t);
					} else {
						console.log('[Start] ❌ error', err.toString())
						reject(err);
					}
				});

			});
		},
		Stop: async(req, res, params) => {
			return new Promise( (resolve, reject) => {
				console.log('[Stop] sending stop...');
				axios.post( 'http://localhost:8888/stop/', req.body ).then( res => {
					console.log('[Stop] 📸 🛑  successfully stopped')
					resolve(res.data);
				}).catch( err => {

					if (err.response) {
						let t = '';
						if (err.response.status) t += err.response.status;
						if (err.response.statusText) t += ': '+err.response.statusText;
						if (err.response.data) t += ': '+err.response.data;
						console.log('[Stop] ❌ error', t)
						reject(t);
					} else {
						console.log('[Stop] ❌ error', err.toString())
						reject(err);
					}
				});

			});
		}
	}, { 
		'/usb': {
			GET: 'files:../usb'
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
		'/hostname': {
			GET: 'ParticipantsList',
			POST: 'SetHostname'
		},
		'/statistics': {
			GET: 'Statistics'
		},
		'/start': {
			POST: 'Start'
		},
		'/stop': {
			POST: 'Stop'
		},
		'/reboot': {
			POST: 'Reboot'
		},
		'/shutdown': {
			POST: 'Shutdown'
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
