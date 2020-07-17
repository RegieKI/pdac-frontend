import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import { json } from 'body-parser'

import { SetupStatic, API } from './server/API.js'


const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

let polk = polka()
	.use( json() ) // for POSTs


	SetupStatic( polk )
	.use( API )
	// Utility( polk )
	// Sirv( polk )
	// polk.use( Directory )
	// .use( Directus )
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware()
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
