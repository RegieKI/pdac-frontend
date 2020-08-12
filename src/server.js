import sirv from 'sirv';
import compression from 'compression';
import * as sapper from '@sapper/server';

import { AutoSetup } from './server/API.js'
import os from 'os'
import wifi from 'node-wifi'
import fs from 'fs'
import DirectusSDK from "@directus/sdk-js"; 


const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const directus = new DirectusSDK({
  url: "https://api.sinnott.cc/",
  project: "pdac"
}); 

wifi.init({
  iface: 'en0'
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
				wifi.connect({ ssid: "ssid", password: "password" }, function(err) {
				  if (err) {
				  	console.error(`[ConnectToNetwork] 🗝  ${ssid} ${err}`);
				  	return reject( {} );
				  }
				  return resolve({ ssid });
				});
			})
		},
		GetInfo: async ( req, res, params ) => {

			return new Promise( (resolve, reject) => {
				wifi.getCurrentConnections(function(err, connections) {
					if (err) return reject(err);
					return resolve( {
						hostname: os.hostname(),
						type: os.type(),
						platform: os.platform(),
						totalmem: os.totalmem(),
						freemem: os.freemem(),
						uptime: os.uptime(),
						connections
					} );
				});
			})

		},
		GetNetworkList: async ( req, res, params ) => {
			return new Promise( (resolve, reject) => {
				wifi.scan(function(err, data) {
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
