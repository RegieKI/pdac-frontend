import UrlPattern from 'url-pattern'

export const SessionID = ( session ) => {

}

export const AutoPreload = async ( page, session, t ) => {

		console.log('AUTOPRELOAD', session);
		
    const p = `${page.path}?as=json`;
    console.log(`[AutoPreload] 🌞 attempting JSON: ${p}`)
    try {
      const r = await t.fetch( p );
      if (r.status !== 200) return t.error( r.status, r.statusText );
      const data = await r.json();
      console.log(`[AutoPreload] ✅ 200 ${Object.keys(data)}`, (process.browser) ? data : '');
      return { data, page };
    } catch(err) {
      console.log(`[AutoPreload] ❌ 501 ${err}`);
      return t.error( 501, err );
    }
}

export const Timestamp = () => {
	const d = new Date();
	let s = d.getFullYear();
	s+= '-'+d.getMonth()
	s+= '-'+d.getDate()
	s+= '-'+d.getHours()
	s+= '-'+d.getMinutes()
	s+= '-'+d.getSeconds()
	return s;
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


export const Strip = (str) => {
	if (!str) {
		// console.warn('[Strip] cannot strip null / undefined string');
		return "";
	}
	return str.replace(/(\r\n|\n|\r)/gm, "").trim()
}



export const NestedExists = (obj, level,  ...rest) => {
	if (obj === undefined) return false
	if (rest.length == 0 && obj.hasOwnProperty(level)) return true
	return checkNested(obj[level], ...rest)
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


export function Memory( bytes ) {

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

	let o = { bytes, kb, mb, gb, use};

	o.auto = o[use] + use;

	return o;
}