
export default {
	'/files*': {
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
}