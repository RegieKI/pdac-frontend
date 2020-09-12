import { writable } from 'svelte/store';
import axios from 'axios'

function createInfoStore() {
	const { subscribe, set, update } = writable( { backend: { session: {}, miband: {} }, wlan0: {}, drives: [] } );

	return {
		subscribe,
		grab: async () => {

			console.log('[stores] ℹ️ getting info... ');
			try {
				let res = await axios.get('/info?as=json');
				let d = res.data;
				console.log('[stores] ℹ️✅ info :  ', d);
				update( n => d );
			} catch (err) {
				console.log('[stores] ℹ️❌ info :  ', err);
			}
		}
	}
}


export const info = createInfoStore();
export const overlay = writable( null );
export const route = writable( {} );