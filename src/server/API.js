
import path from 'path'
import os from 'os'
import send from '@polka/send-type'
import wifi from 'node-wifi'
import regexparam from 'regexparam'
import UrlPattern from 'url-pattern'
import { json, urlencoded } from 'body-parser'
import polka from 'polka';

import Sirv from './Sirv.js';
import { Loop, LoopRoutes, RegExecute, IsFilesPath, IsJsonPath, CleanFilesPath, CleanJsonPath } from './../helpers/Utils.js'



export const HandleError = ( res, err ) => {

	const data = (err.length && err) || err.message;
	let status = err.code || err.status || 500;
	status = (status >= 100 && status < 600) ? status : 500;
	const message = (data && data.message) || data;
	console.log( '[API]', `✋ ${status} : ${message}` );
    res.setHeader('Content-Type', 'application/json');
	return send( res, status, { status, message } );
}

export const SendSuccess = ( res, data ) => {
	console.log( '[API]', `✅ sending JSON response { ${Object.keys(data)} }` );
	return send( res, 200, data );
}

export const AutoSetup = ( Endpoints, Routes ) => {

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

	p.use( API( Endpoints, Routes ) );

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

export const API = ( Endpoints, Routes ) => {

	console.log('[AutoSetup] ✏️  ', 'adding API...');

	let endpoints = Endpoints;

	return ( req, res, next ) => {


		let inp = req.path;

		const isJson = req.query.as === 'json';
		const isSys = req.path === '/manifest.json'

		/*--------------- RETURN if not JSON ---------------*/

		if ( !isJson || isSys ) {
			console.log( '[API]', `✈️  skipping ${req.method} ${inp} because not JSON...`);
			return next();
		}

		/*--------------- Find Match ---------------*/

		console.log( '[API]', `🤖 finding ${req.method} ${inp} match...`, inp, req.query)
		let route = FindRoutesMatch( inp, Routes, req.method );

		/*--------------- RETURN if no match ---------------*/
		
		if ( route === null ) return SendSuccess( res, {})
		if ( route.type !== req.method ) return HandleError( res, { code: 404, message: `mismatch of request methods: ${route.type}/${req.method}` });

		const func = endpoints[route.func];

		if ( func === undefined ) return HandleError( res, { code: 404, message: `no Directus endpoint found for ${route.func}` })

		console.log( '[API]', `🌐  using "${func.name}" endpoint` );

		func( req, res, route.match ).then( data => {
			if (data.statusText) console.log('[API] ✅  Success statusText:', data.statusText );
			if (data.data) console.log('[API] ✅  Success data.data:', data.data );
			return SendSuccess( res, data );
		}).catch( err => {
			// return res.end();
			// console.log('boop');
			return HandleError(res, err)
		});
	}


}

