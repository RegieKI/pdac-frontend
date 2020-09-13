export async function get(req, res, next) {
	// the `slug` parameter is available because this file
	// is called [slug].json.js
	console.log('JSON!!!!!', req.params, req.body);
	next();
}