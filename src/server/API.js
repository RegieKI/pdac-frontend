import fs from 'fs'
import path from 'path'
import sirv from 'sirv';
import os from 'os'
import send from '@polka/send-type'
import wifi from 'node-wifi'
import DirectusSDK from "@directus/sdk-js";
import regexparam from 'regexparam'
import UrlPattern from 'url-pattern'

import Endpoints from './Endpoints.js'
import Routes from './Routes.js'
import { Loop, LoopRoutes, RegExecute, IsFilesPath, IsJsonPath, CleanFilesPath, CleanJsonPath, FindRoutesMatch } from './../helpers/Utils.js'


wifi.init({
  iface: 'en0'
});

const directus = new DirectusSDK({
  url: "https://api.sinnott.cc/public/",
  project: "pdac"
}); 



export const SetupStatic = ( polka ) => {


	LoopRoutes( Routes, ( url, func, type, index ) => {
		if ( IsFilesPath( func ) ) {
			const p = path.resolve( func.substr(6,func.length) );
			console.log('[SetupStatic]', 'adding...', url, p);
			polka.use( url, sirv( p ) );
		}
	});

	return polka
}

export const SendError = ( res, code, msg ) => {
	console.log( '[API]', `✋ ${code} { ${Object.keys(msg)} } ${msg}` );
	res.statusCode = code;
	return res.end();
}

export const SendSuccess = ( res, data ) => {
	console.log( '[API]', `✅ sending JSON response { ${Object.keys(data)} }` );
	return send( res, 200, data );
}

export const API = ( req, res, next ) => {


	let inp = req.path;

	const isJson = inp.substr( inp.length - 5, inp.length ) !== '.json';
	const isSys = req.path === '/manifest.json'

	/*--------------- RETURN if not JSON ---------------*/

	if ( isJson || isSys ) return next();

	/*--------------- Find Match ---------------*/


	console.log( '[API]', `🌀 finding ${inp} match...`)
	let route = FindRoutesMatch( inp, Routes, req.method );

	/*--------------- RETURN if no match ---------------*/
	
	if ( route === null ) return SendError( res, 404, `no route found for "${inp}"`)
	if ( route.type !== req.method ) return SendError( res, 404, `mismatch of request methods: ${route.type}/${req.method}`);

	if ( IsFilesPath( route.func ) ) {

		/*--------------- File List Directories ---------------*/

		// find root without any wildcards and remove from input path...

		let root = req.path;
		Loop( route.match, (o, key, i) => { root = root.replace(o, '') });

		inp = inp.replace(root, '');

		// remove files: prepended...

		route.func = path.resolve( CleanFilesPath( route.func ) );

		// get full directory path...

		const dir = path.join(route.func, CleanJsonPath(inp));
		console.log( '[API]', '🗂  using fs.readdir on:', dir );

		fs.readdir( dir, (err, files) => {
			if (err) return SendError( res, 501, err );
			const data = Object.values(files);
			return SendSuccess( res, data );
		});
		
	} else {
		const func = Endpoints[route.func];
		if ( func === undefined ) return SendError( res, 404, `no Directus endpoint found for ${route.func}`)

		console.log( '[API]', `🌐  using "${func.name}" endpoint` );

		func( req, res, route.match ).then( data => {
			return SendSuccess( res, data );
		}).catch( err => {
			return SendError( res, 501, err );

		});
	}


}

export async function DirectusEndpoint( req, res, config ) {
	console.log( '[API]', `🐇  finding "${config.type}" items from Directus...`);
	return (await directus.getItems( config.type, config.args)).data;
};

