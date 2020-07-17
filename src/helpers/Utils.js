import UrlPattern from 'url-pattern'

export const FindRoutesMatch = ( inputPath, routes ) => {

	let route = null;
	LoopRoutes( routes, ( url, func, type, index ) => {

		const reg = new UrlPattern(url);
		const clean = CleanJsonPath(inputPath);
		const match = reg.match( clean );
		const didMatch = match !== null;
		console.log( '[API]', didMatch ? `✅` : '🌀', inputPath, index, type, url );

		if (didMatch) route = { url, func, match }

	});

	return route;
};


export const Loop = ( object, callback ) => {
	Object.keys(object).forEach( (key, i) => {
		const o = object[key];
		callback( o, key, i );
	});
}

export const LoopRoutes = ( routes, callback ) => {

	Loop( routes, (o, url, index) => {
		Loop( o, ( func, type, ii ) => {
			callback( url, func, type, index );
		});
	});
}

export function RegExecute(path, result) {
	let i=0, out={};
	let matches = result.pattern.exec(path);
	while (i < result.keys.length) {
		out[ result.keys[i] ] = matches[++i] || null;
	}
	return out;
}

export function IsFilesPath( p ) {
	return p.substr(0,6) === 'files:';
}

export function IsJsonPath( p ) {
	return p.substr( p.length - 5, p.length ) === '.json';
}

export function CleanFilesPath( p ) {

	if ( IsFilesPath(p) ) return p.substr(6, p.length );
	return p;
}
export function CleanJsonPath( p ) {

	if ( IsJsonPath(p) ) return p.substr(0, p.length - 5);
	return p;
}

export async function POST( url, params ) {
	const r = await fetch( url, {
			method: 'post',
			headers: {'Content-Type' : 'application/json'},
			body: JSON.stringify( params )
		});
	return await r.json();
}

export async function GET( url, params ) {

	const r = await fetch( url );
	return await r.json();
}

export function MEM( bytes ) {

	let kb = bytes/1024; 
	let mb = kb/1024; 
	let gb = mb/1024; 
	   
	kb = Math.floor(kb); 
	mb = Math.floor(mb); 
	gb = Math.floor(gb); 
	   
	mb = mb%1024; 
	kb = kb%1024; 
	bytes = bytes%1024; 

	let use = 'kb';
	if ( mb > 1 ) use = 'mb';
	if ( gb > 1 ) use = 'gb';

	return { bytes, kb, mb, gb, use};
}