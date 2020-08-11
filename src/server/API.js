import fs from 'fs'
import path from 'path'
import os from 'os'
import send from '@polka/send-type'
import wifi from 'node-wifi'
import DirectusSDK from "@directus/sdk-js";
import regexparam from 'regexparam'
import UrlPattern from 'url-pattern'
import { json, urlencoded } from 'body-parser'
import polka from 'polka';

import Sirv from './Sirv.js';
import Endpoints from './Endpoints.js'
import { Loop, LoopRoutes, RegExecute, IsFilesPath, IsJsonPath, CleanFilesPath, CleanJsonPath } from './../helpers/Utils.js'


wifi.init({
  iface: 'en0'
});

const directus = new DirectusSDK({
  url: "https://api.sinnott.cc/",
  project: "pdac"
}); 



export const SendError = ( res, code, msg ) => {
	console.log( '[API]', `✋ ${code} { ${Object.keys(msg)} } ${msg}` );
	res.statusCode = code;
	return res.end();
}

export const SendSuccess = ( res, data ) => {
	console.log( '[API]', `✅ sending JSON response { ${Object.keys(data)} }` );
	return send( res, 200, data );
}

export const AutoSetup = ( Routes ) => {

	let p = polka();
	p.use( urlencoded() );
	p.use( json() );

	LoopRoutes( Routes, ( url, func, type, index ) => {
		if ( IsFilesPath( func ) ) {
			const pathname = path.resolve( func.substr(6,func.length) );
			console.log('[AutoSetup] ✏️  ', 'adding static...', url, pathname);
			p.use( Sirv( pathname , {
				path: url
			}) ); 
		} 
	});

	p.use( API( Routes ) );

	return p;
}

const FindRoutesMatch = ( inputPath, Routes, inputType ) => {
	if (inputType === undefined) inputType = "GET";
	let route = null;
	LoopRoutes( Routes, ( url, func, type, index ) => {

		const reg = new UrlPattern(url);
		const clean = CleanJsonPath(inputPath);
		const match = reg.match( clean );
		const didMatch = ( match !== null && inputType.toLowerCase() === type.toLowerCase());
		console.log( '[API]', didMatch ? `✅` : '🌀', inputPath, index, type, url );

		if (didMatch) route = { url, func, match, type }

	});

	return route;
};

export const API = ( Routes ) => {

	console.log('[AutoSetup] ✏️  ', 'adding API...');

	return ( req, res, next ) => {


		let inp = req.path;

		const isJson = req.query.as === 'json';
		const isSys = req.path === '/manifest.json'

		/*--------------- RETURN if not JSON ---------------*/

		if ( !isJson || isSys ) return next();

		/*--------------- Find Match ---------------*/


		console.log( '[API]', `🤖 finding ${inp} match...`, inp)
		let route = FindRoutesMatch( inp, Routes, req.method );

		/*--------------- RETURN if no match ---------------*/
		
		if ( route === null ) return SendSuccess( res, {})
		if ( route.type !== req.method ) return SendError( res, 404, `mismatch of request methods: ${route.type}/${req.method}`);

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

