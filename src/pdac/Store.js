import { writable } from 'svelte/store';
import { POST, GET } from '../helpers/Utils.js'

function createInfo() {
	const { subscribe, set, update } = writable({});

	return {
		subscribe,
		grab: async () => {

			const data = await GET('/info.json');
			update( n => data );
		}
	}
}


export const info = createInfo();