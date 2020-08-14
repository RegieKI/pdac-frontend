import { writable } from 'svelte/store';
import { POST, GET, MEM } from '../helpers/Utils.js'

function createInfo() {
	const { subscribe, set, update } = writable({ active: false, connection: {} });

	return {
		subscribe,

		grab: async () => {

			let data = await GET('/info?as=json');
			const mem = MEM( data.freemem );
			data.memory = mem[mem.use] + mem.use;
			data.isConnected = false;
			for (let i = 0; i < data.iface.length; i++) {
				let n = data.iface[i];
				if (n.flags !== '[DISABLED]' || n.flags.length === 0) {
					data.isConnected = true;
					data.connection = n;
					break;
				}
			}
			data.active = true;
			console.log('[info] ', data);
			// const num = data.connection.frequency;
			// data.connection.freq = (num > 5000 && num < 6000) ? "5ghz" : (num > 2400 && num < 2500) ? "2.4ghz" : ((num/100)*10)+"ghz";
			update( n => data );
		}
	}
}


export const info = createInfo();