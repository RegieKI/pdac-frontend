import os from 'os'
import wifi from 'node-wifi'
import { DirectusEndpoint } from './API.js'

export default {
	SessionByID: async ( req, res, params ) => {
		return await DirectusEndpoint(req, res, {
			type: 'session',
			args: {
				"filter[url][eq]": params.session,
				"fields": "*,exercises.exercise_id.*,exercises.exercise_id.tags.tag_id.*",
			}
		});
	},
	SessionsList: async ( req, res, params ) => {
		return await DirectusEndpoint(req, res, {
			type: 'session',
			args: {
				"filter[status][eq]": "published",
				"fields": "*,exercises.exercise_id.*,exercises.exercise_id.tags.tag_id.*",
			}
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
}
