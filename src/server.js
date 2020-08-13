import sirv from 'sirv';
import compression from 'compression';
import * as sapper from '@sapper/server';

import { POST, PUT, GET } from './helpers/Utils.js'

import axios from 'axios'
import { AutoSetup } from './server/API.js'
import os from 'os'
import wifi from './../pi-wifi';

import fs from 'fs'
import DirectusSDK from "@directus/sdk-js"; 


const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const directus = new DirectusSDK({
  url: "https://api.sinnott.cc/",
  project: "pdac"
}); 




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
		Statistics: async(req, res, params ) => {
			return new Promise( (resolve, reject ) => {

				// get temp: /opt/vc/bin/vcgencmd measure_temp
				resolve();
			});
		},
		ConnectToNetwork: async( req, res, params ) => {

			return new Promise( (resolve, reject) => {
				const pass = req.body.password
				const ssid = req.query.ssid;
				console.log(`[ConnectToNetwork] 🗝  ${ssid}/${pass}`	);
				resolve({});
				// wifi.connect({ ssid: "ssid", password: "password" }, function(err) {
				//   if (err) {
				//   	console.error(`[ConnectToNetwork] 🗝  ${ssid} ${err}`);
				//   	return reject( {} );
				//   }
				//   return resolve({ ssid });
				// });
			}) 
		},
		GetInfo: async ( req, res, params ) => {

			return new Promise( (resolve, reject) => {
				wifi.detectSupplicant(function(err, iface, supplicant) {
					console.log('OIOI>>>', iface, supplicant);
					if (err) return reject(err);
					return resolve( {
						hostname: os.hostname(),
						type: os.type(),
						platform: os.platform(),
						totalmem: os.totalmem(),
						freemem: os.freemem(),
						uptime: os.uptime(),
						iface,
						supplicant
					} );
				});
			})

		},
		GetNetworkList: async ( req, res, params ) => {
			return new Promise( (resolve, reject) => {
				wifi.listNetworks(function(err, data) {
					if (err) return reject(err);
					return resolve( data );
				});
			})
		},
		'UpdateNetwork': async ( req, res, params ) => {
			// wifi.disconnect(function(err) {
			// 	if (err) {
			// 		console.log(err);
			// 	}
			// 	console.log("Disconnected");
			// 	return send(res, 200, { type: 'utility' } );
			// });
		},
		Start: async(req, res, params) => {
			return new Promise( (resolve, reject) => {
				console.log('[Start] sending config:', req.body);
				axios.post( 'http://localhost:8888/start/', req.body ).then( res => {
					resolve(res);
				}).catch( err => {
					reject(err);
				});

			});
		},
		Stop: async(req, res, params) => {
			return new Promise( (resolve, reject) => {
				console.log('[Stop] sending:', req.body);
				POST( 'http://localhost:8888/stop/', req.body ).then( res => {
					resolve(res);
				}).catch( err => {
					reject(err);
				});

			});
		}
	}, { 
		'/recordings': {
			GET: 'files:../recordings'
		},
		'/info': { 
			GET: 'GetInfo'
		},
		'/network/list': {
			GET: 'GetNetworkList'
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
