import Sirv from './server/Sirv.js';
import compression from 'compression'
import * as sapper from '@sapper/server'
import temp from 'pi-temperature'
import nodeDiskInfo from 'node-disk-info'
import axios from 'axios'
import { AutoSetup } from './server/API.js'
import os from 'os'
import wifi from './server/PiWifi.js';
import fs from 'fs'
import DirectusSDK from "@directus/sdk-js"
import { exec, spawn } from 'child_process'
import path from 'path'
import untildify from 'untildify'


const rootPath = untildify('~/')

const config = {
	directus_url: 'https://api.sinnott.cc/',
	directus_project: 'pdac',
	pdac_root: path.resolve(rootPath+'/pdac/'),
	pdac_usb: path.resolve(rootPath+'/pdac/usb'),
	pdac_utils: path.resolve(rootPath+'/pdac/system')
}

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const directus = new DirectusSDK({
  url: config.directus_url,
  project: config.directus_project
});


console.log(`----------------------------------------> mode: ${process.env.NODE_ENV}`);

const isDev = (process.env.NODE_ENV == 'development')

let browser, backend;


axios.get('http://localhost:8888').then( res => {
	console.log('[server.js] 🥚  backend is running! not starting.')
}).catch( err => {
	

	backend = spawn('sh', [config.pdac_utils + '/runBackend.sh']);
	console.log('[server.js] 🥚  spawning runBackend.sh with PID', backend.pid );

	backend.stdout.pipe(process.stdout)
	backend.on('exit', function() {
		console.log('[server.js] ⚰️  backend has exited, restarting...');
		backend = spawn('sh', [config.pdac_utils + '/runBackend.sh']);
		// if (!isDev) {
		// 	console.log('[server.js] ⚰️  killing all...');
		// 	exec(`sh ${config.pdac_utils}/killAll.sh`);
		// 	process.exit();
		// }
	})

	setTimeout( function() { 
		browser = spawn('sh', [config.pdac_utils + '/launchBrowser.sh']);
		console.log('[server.js] 🥚  spawning launchBrowser.sh >>>>>', browser.pid );
	}, 10000)

})

AutoSetup(
	{ 
		SessionByID: async ( req, res, params ) => {
			const filters = "*,exercises.exercise_id.*,exercises.exercise_id.tags.tag_id.*,exercises.exercise_id.example.*";
			console.log('[server.js] 🐇  directus:', '/session?filter[url][eq]=' + params.session + '&fields=' + filters );
			return (await directus.getItems( 'session', {
					"filter[url][eq]": params.session,
					"fields": filters
				}
			)).data;
		},
		SessionsList: async ( req, res, params ) => {
			return (await directus.getItems( 'session', {
					// "filter[status][eq]": "published",
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
		SystemReboot: async(req, res, params ) => {
			return new Promise( (resolve, reject ) => {
				exec(`sh ${config.pdac_utils}/utilityRebootNow.sh`, function( err, out, code ) {
					console.log('[server.js] 👂 REBOOT ', err, out, code);
				});
				resolve({});
			});
		},
		SystemShutdown: async(req, res, params ) => {
			return new Promise( (resolve, reject ) => {
				exec(`sh ${config.pdac_utils}/utilityShutdownNow.sh`, function( err, out, code ) {
					console.log('[server.js] 👂 SHUTDOWN ', err, out, code);
				});
				resolve({});
			});
		},
		CalibrateScreen: async(req, res, params ) => {
			return new Promise( (resolve, reject ) => {
				exec(`sh ${config.pdac_utils}/launchCalibrator.sh`, function( err, out, code ) {
					console.log('[server.js] 👂 CALIBRATE ', err, out, code);
				});
				resolve({});
			});
		},
		Info: async ( req, res, params ) => {

			return new Promise( (resolve, reject) => {


				function getInfo( resolve, reject, backend ) {
					nodeDiskInfo.getDiskInfo().then( drives => {
						wifi.status( 'wlan0', function(err, status) {
							let ip = "unknown"

							try {
								ip = exec(`sh ${config.pdac_utils}/utilityShowIP.sh`, function(err, stdout, stderr) {
									ip = stdout.replace('\n', '') || "unknown";
									console.log('>>>>> IP', ip)
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
												temperature,
												ip
											} );
									});
								})
							} catch (err3) {
								console.log('[Info] ❌ error constructing response:', err3.message);
								return( err3)	
							}
						});
					});
				}
				const miPath = config.pdac_usb+'/miband.txt'

				fs.readFile( miPath, "utf8", (err, data) => {
						console.log('[Info] ✅  read miband.txt...', data);
						const mac_address = (err) ? 'UNKNOWN' : data.replace(/(\r\n|\n|\r)/gm, "").trim();
						axios.get('http://localhost:8888/status', { timeout: 2000 } ).then( res => {
							console.log('[Info] ✅  success: backend connected...', Object.keys(res), res.data);
							return getInfo( resolve, reject, { ...res.data, mac_address, active: true } );
						}).catch( err => {
							console.log('[Info] ❌  error: backend not connected...', Object.keys(err));
							return getInfo( resolve, reject, { mac_address, active: false, session: {}, miband: {} } );
						});
				});
			})

		},
		Ping: async ( req, res, params ) => {
			return new Promise( (resolve, reject) => {
				axios.get(config.directus_url + 'server/ping' ).then( res => {
					resolve( 'PONG' );
				}).catch( err => {
					reject( err );
				});
			})
		},
		SetMibandAddress: async ( req, res, params ) => {
			return new Promise( (resolve, reject) => {
				console.log('[SetMibandAddress] setting...', req.body.mac_address);
				fs.writeFile( config.pdac_usb+'/miband.txt', req.body.mac_address, (err) => {
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
				const wlanPath = config.pdac_usb+'/wlan.txt';
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
		Buzz: async(req, res, params) => {
			return new Promise( (resolve, reject) => {
					const seq = req.body.sequence || '200 200 10 0.001';
					exec(`/usr/bin/python ${config.pdac_utils}/pythonBuzz.py ${seq}`);
					resolve({});
			});
		},
		CameraStart: async(req, res, params) => {
			return new Promise( (resolve, reject) => {
				console.log('[CameraStart] 📸 starting camera : sending config:', req.body);
				axios.post( 'http://localhost:8888/start/', req.body, { timeout: 180 * 1000 } ).then( res => {
					console.log('[CameraStart] 📸 ✅  successfully started')
					if (req.body.buzz) exec(`/usr/bin/python ${config.pdac_utils}/buzz.py ${req.body.buzz}`);
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
				axios.post( 'http://localhost:8888/stop/', req.body, { timeout: 180 * 1000 }  ).then( res => {
					console.log('[CameraStop] 📸 🛑  successfully stopped')
					return resolve(res.data);
				}).catch( err => {
						
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
		},
		RcloneCheck: async( req, res, params ) => {
			return new Promise( (resolve, reject) => {

				exec(`sh ${config.pdac_utils}/rcloneCheck.sh`, function(err, stdout, stderr) {
					console.log('[server.js] 👁✅  rclone check:', stderr);
				  let out = {};

				  try {

				  	
						/* [START] last-minute-fix 21/09/20 */

						const ids = ['matching_files', 'differences_found', 'files_missing', 'errors_while_checking'];
						stderr.split('\n').forEach( line => {

							ids.forEach( id => {
								let i = line.indexOf(id);
								if (i == -1) i = line.indexOf( id.replace(/_/g, ' ') );
								if ( i != -1 ) {

									console.log(i);
									const ii = line.lastIndexOf(':');
									if (ii != -1) {
										let num = line.substring(ii + 1, i);
										out[id] = parseInt(num);
									}
								}
							});

						});

						console.log('----------')
						console.log(out)
						console.log('----------')  

						/* [END] last-minute-fix 21/09/20 */


					  return resolve( out )
					} catch(err) {
						return reject(err);
					}
				});
			}) 
		},
		UpdateSystem: async( req, res, params ) => {
			return new Promise( (resolve, reject) => {
				exec(`sh ${config.pdac_utils}/launchLXTerminal.sh ${config.pdac_utils}/updateSystem.sh`, function(err,stdout, stderr) {
					console.log('[server.js] 🌐  update system...', err, stderr, stdout);
					resolve();
				});
			})
		},
		RcloneSync: async( req, res, params ) => {
			return new Promise( (resolve, reject) => {

				exec(`sh ${config.pdac_utils}/rcloneSync.sh`, function(err, stdout, stderr) {
					console.log('[server.js] 🌐✅  rclone sync:', stderr);
				  try {
				  	let out = "";
				  	stderr.substring( stderr.indexOf('Transferred:') ).split('\n').forEach( (l, i) => {
				  		if (i < 3) out += l + '<br />';
				  	})
					  return resolve( out );
					} catch(err) {
						return reject( err );
					}
				});
			}) 
		},
		DangerZone: async( req, res, params ) => {
			return new Promise( (resolve, reject) => {

				console.log('[server.js] 👹☠️  welcome to the danger zone! ☠️👹  ');
				exec(`sh ${config.pdac_utils}/dangerDeleteRecordings.sh`, function(err, stdout, stderr) {
					if (err) {
						console.log('[server.js] ☠️❌  danger zone! error:', err, stdout, stderr);
						return reject( err );
					}
					console.log('[server.js] ☠️✅  danger zone! success:', stderr, stdout);
					return resolve( stdout );
				});
			}) 
		},
		GetHostname: async( req, res ) => {
			return new Promise( (resolve, reject) => {
				fs.readFile( config.pdac_usb+'/hostname.txt', 'utf8', function( errB, hostname ) {

					if (errB) return reject( { message: 'could not read usb/hostname.txt' } );
					return resolve( { hostname } )
				})
			});
		},
		SetHostname: async(req, res, params ) => {
			return new Promise( (resolve, reject ) => {

				fs.writeFile( '/etc/hostname', req.body.hostname, (err) => {
					if (err) {
						console.log('could not write hostname', err.message)
						return reject( { message: 'could not write /etc/hostname: ' + err.message } );
					}
					const run = `sh ${config.pdac_utils}/utilityRebootNow.sh`
					console.log('[SetHostname] restarting with:', run);
					exec(run, function(err, stdout, stderr) {
						if (err) {
							console.log('[SetHostname] 😘❌  restart hostname error:', err, stdout, stderr);
							return reject( { message: 'could not restart' } );
						}
						console.log('[SetHostname] 😘✅  restart hostname success:', stderr, stdout);
						return resolve( stdout );
					});
				});
			});
		},
		GetDhcpcd: async( req, res ) => {
			return new Promise( (resolve, reject) => {
				fs.readFile( '/etc/dhcpcd.conf', 'utf8', function( errA, dhcpConf ) {

					if (errA) return reject( { message: 'could not read /etc/dhcpcd.conf' } );
					fs.readFile( config.pdac_usb+'/dhcp.txt', 'utf8', function( errB, dhcpTxt ) {

						if (errB) return reject( { message: 'could not read usb/dhcp.txt' } );
						return resolve( { config: dhcpConf, txt: dhcpTxt } )
					})

				} )
			});
		},
		SetDhcpcd: async( req, res ) => {

			return new Promise( (resolve, reject) => {
				console.log('[SetDhcpcd] setting...', req.body.blob);
				fs.writeFile( '/etc/dhcpcd.conf', req.body.blob, (err) => {
					if (err) return reject( { message: 'could not write /etc/dhcpcd.conf' } );
					const run = `sh ${config.pdac_utils}/utilityRebootNow.sh`
					console.log('[SetDhcpcd] restarting with:', run);
					exec(run, function(err, stdout, stderr) {
						if (err) {
							console.log('[SetDhcpcd] 😘❌  restart dhcp error:', err, stdout, stderr);
							return reject( { message: 'could not restart DHCP' } );
						}
						console.log('[SetDhcpcd] 😘✅  restart dhcp success:', stderr, stdout);
						return resolve( stdout );
					});
				});
			})
		}
	}, 
	{ 
		'/system/dhcp': {
			GET: 'GetDhcpcd',
			POST: 'SetDhcpcd'
		},
		'/usb': {
			GET: `files:${config.pdac_usb}`
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
		'/session/:session/preview': {
			GET: 'SessionByID'
		},
		'/session/:session/complete': {
			GET: 'SessionByID'
		},
		'/session/:session/:idx': {
			GET: 'SessionByID'
		},
		'/camera/start': {
			POST: 'CameraStart'
		},
		'/camera/stop': {
			POST: 'CameraStop'
		},
		'/system/reboot': {
			POST: 'SystemReboot'
		},
		'/system/shutdown': {
			POST: 'SystemShutdown'
		},
		'/system/update': {
			POST: 'UpdateSystem'
		},
		'/system/calibrate': {
			POST: 'CalibrateScreen'
		},
		'/system/hostname': {
			GET: 'GetHostname',
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
		'/buzz': {
			POST: 'Buzz'
		},	
		'/sync': {
			GET: 'RcloneCheck',
			POST: 'RcloneSync'
		},
		'/sync/clearup': {
			POST: 'DangerZone'
		},
		'/ping': {
			GET: 'Ping'
		}
	})
	.use(
		compression({ threshold: 0 }),
		Sirv('static', { dev }),
		sapper.middleware()
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});



