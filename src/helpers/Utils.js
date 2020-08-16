import UrlPattern from 'url-pattern'

export const SessionID = ( session ) => {

}

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
	return p.indexOf('?as=json') !== -1;
}

export function CleanFilesPath( p ) {

	if ( IsFilesPath(p) ) return p.substr(6, p.length );
	return p;
}
export function CleanJsonPath( p ) {

	if ( IsJsonPath(p) ) return p.replace('?as=json', '');
	return p;
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