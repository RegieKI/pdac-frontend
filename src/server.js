import sirv from 'sirv';
import compression from 'compression';
import * as sapper from '@sapper/server';
import { json, urlencoded } from 'body-parser'

import { AutoSetup } from './server/API.js'


const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

AutoSetup({
	'/files': {
		GET: 'files:/Users/gilbertsinnott/Google Drive/_Autr'
	},
	'/info': { 
		GET: 'GetInfo'
	},
	'/network/list': {
		GET: 'GetNetworkList'
	},
	'/network/connect': {
		POST: 'ConnectToNetwork'
	},
	'/session': {
		GET: 'SessionsList'
	},
	'/session/:session': {
		GET: 'SessionByID'
	},
	'/session/:session/exercise': {
		GET: 'SessionByID'
	},
	'/session/:session/exercise/:exercise': {
		GET: 'SessionByID'
	}
})
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware()
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
