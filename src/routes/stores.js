import { writable } from 'svelte/store';
import axios from 'axios'

function createInfoStore() {
	const { subscribe, set, update } = writable( { backend: { session: {}, miband: {} }, wlan0: {}, drives: [] } );

	return {
		subscribe,
		set,
		update
		// grab: () => {
		// 	console.log('HRABBINMG!!!');
		// 	return new Promise( (resolve, reject) => {
		// 	console.log('PROMISE!!!');
		// 		axios.get('/info?as=json').then(res=>{

		// 			const d = res.data;
		// 			console.log('[info] ℹ️  ', d);
		// 			set( d );
		// 			resolve(d);
		// 		}).catch(err => {
		// 			console.error('[info] ℹ️  ', err);
		// 			reject({});
		// 		});

		// 	})
		// }
	}
}


export const info = createInfoStore();
export const overlay = writable( null );
export const route = writable( {} );