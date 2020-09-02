import { writable } from 'svelte/store';
import axios from 'axios'

function createInfoStore() {
	const { subscribe, set, update } = writable( { backend: { miband: {} }, session: {}, wlan0: {}, drives: [] } );

	return {
		subscribe,

		grab: async () => {

			let res = await axios.get('/info?as=json');
			let d = res.data;
			console.log('[info] ℹ️  ', d);
			update( n => d );
		}
	}
}


export const info = createInfoStore();
export const overlay = writable( null );
export const previousPage = writable( "/" );