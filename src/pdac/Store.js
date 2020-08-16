import { writable } from 'svelte/store';
import axios from 'axios'
import {MEM} from '../helpers/Utils.js'

function createInfoStore() {
	const { subscribe, set, update } = writable({ active: false, connection: {} });

	return {
		subscribe,

		grab: async () => {

			let data = await axios.get('/info?as=json');
			const mem = MEM( data.freemem );
			data.memory = mem[mem.use] + mem.use;
			data.isConnected = false;
			if (data.iface) {
				for (let i = 0; i < data.iface.length; i++) {
					let n = data.iface[i];
					if (n.flags !== '[DISABLED]' || n.flags.length === 0) {
						data.isConnected = true;
						data.connection = n;
						break;
					}
				}
			} else {
				data.iface = [];
			}
			data.active = true;
			console.log('[info] ', data);
			// const num = data.connection.frequency;
			// data.connection.freq = (num > 5000 && num < 6000) ? "5ghz" : (num > 2400 && num < 2500) ? "2.4ghz" : ((num/100)*10)+"ghz";
			update( n => data );
		}
	}
}


export const info = createInfoStore();
export const overlay = writable( null );
