const fs = require('fs');
const path = require('path');
const { join, normalize, resolve } = require('path');
const parser = require('@polka/url');
const mime = require('mime/lite');
import send from '@polka/send-type'
import { IsFilesPath, IsJsonPath } from './../helpers/Utils.js'


const FILES = {};
const DIRS = {};
const noop = () => {};

function toAssume(uri, extns) {
	let i=0, x, len=uri.length - 1;
	if (uri.charCodeAt(len) === 47) {
		uri = uri.substring(0, len);
	}

	let arr=[], tmp=`${uri}/index`;
	for (; i < extns.length; i++) {
		x = '.' + extns[i];
		if (uri) arr.push(uri + x);
		arr.push(tmp + x);
	}

	return arr;
}

function find(uri, extns) {
	let i=0, data, arr=toAssume(uri, extns);
	for (; i < arr.length; i++) {
		if (data = FILES[arr[i]]) return data;
	}
}

function is404(req, res) {
	return (res.statusCode=404,res.end());
}

function list(dir, fn, pre='') {
	fn(pre, dir, fs.statSync( dir ), true);
	let i=0, abs, stats;
	let arr = fs.readdirSync(dir);
	for (; i < arr.length; i++) {
		abs = join(dir, arr[i]);
		stats = fs.statSync(abs);
		if ( stats.isDirectory() ) {
			list(abs, fn, join(pre, arr[i]))
		} else {
			fn(join(pre, arr[i]), abs, stats, false);
		}
	}
}

function sendSuccess(req, res, file, stats, headers={}) {
	let code=200, opts={};

	if (req.headers.range) {
		code = 206;
		let [x, y] = req.headers.range.replace('bytes=', '').split('-');
		let end = opts.end = parseInt(y, 10) || stats.size - 1;
		let start = opts.start = parseInt(x, 10) || 0;

		if (start >= stats.size || end >= stats.size) {
			res.setHeader('Content-Range', `bytes */${stats.size}`);
			res.statusCode = 416;
			return res.end();
		}

		headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`;
		headers['Content-Length'] = (end - start + 1);
		headers['Accept-Ranges'] = 'bytes';
	}

	res.writeHead(code, headers);
	fs.createReadStream(file, opts).pipe(res);
}

export default (dir, opts={}) => {
	dir = resolve(dir || '.');

	let isNotFound = opts.onNoMatch || is404;
	let extensions = opts.extensions || ['html', 'htm'];
	let setHeaders = opts.setHeaders || noop;
	let rootPath = opts.path || '/';

	if (opts.dev) {
		return function (req, res, next) {
			let stats, file, uri=decodeURIComponent(req.path || req.pathname || parser(req).pathname);
			let arr = [uri].concat(toAssume(uri, extensions)).map(x => normalize(join(dir, x))).filter(x => {
				return x.startsWith(dir) && fs.existsSync(x);
			});

			while (file = arr.shift()) {
				stats = fs.statSync(file);
				if (stats.isDirectory()) continue;
				setHeaders(res, uri, stats);
				return sendSuccess(req, res, file, stats, {
					'Content-Type': mime.getType(file),
					'Last-Modified': stats.mtime.toUTCString(),
					'Content-Length': stats.size,
				});
			}
			return next ? next() : isNotFound(req, res);
		}
	}

	let cc = opts.maxAge != null && `public,max-age=${opts.maxAge}`;
	if (cc && opts.immutable) cc += ',immutable';

	list(dir, (name, abs, stats, isDir) => {

		let key = path.join( rootPath + '/', name.replace(/\\+/g, '/') );

		if (isDir) {
			if (key.substr(key.length-1, key.length) === '/') key = key.substr(0, key.length-1);
			DIRS[key] = abs;
			return;
		}


		if (!opts.dotfiles && name.charAt(0) === '.') {
			return;
		}

		let headers = {
			'Content-Length': stats.size,
			'Content-Type': mime.getType(name),
			'Last-Modified': stats.mtime.toUTCString(),
		};

		if (cc) headers['Cache-Control'] = cc;
		if (opts.etag) headers['ETag'] = `W/"${stats.size}-${stats.mtime.getTime()}"`;

		FILES[key] = { abs, stats, headers };
	});

	return function (req, res, next) {
		let pathname = decodeURIComponent(req.path || req.pathname || parser(req).pathname);

		const isJson = req.query.as === 'json';
		if (isJson) console.log(`[Sirv] 🌀 looking for stored directory or file...`);

		if ( isJson && FILES[pathname] ) {
			console.log(`[Sirv] ✅🗂  returning file...`);
			const stats = fs.statSync( FILES[pathname].abs );
			return send( res, 200, stats);

		} else if ( isJson && DIRS[pathname] ) {

			console.log(`[Sirv] ✅🗂  returning directory...`);
			fs.readdir( DIRS[pathname], (err, files) => {
				if (err) return isNotFound(req, res);
				const d = Object.values(files);
				return send( res, 200, d);
			});
		} else {

			let data = FILES[pathname] || find(pathname, extensions);
			if (!data) return next ? next() : isNotFound(req, res);
			setHeaders(res, pathname, data.stats);
			sendSuccess(req, res, data.abs, data.stats, data.headers);
		}


	};
}
