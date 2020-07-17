<script context="module">

	import { FindRoutesMatch } from '../helpers/Utils.js'
	import Routes from '../server/Routes.js'

	export async function preload( page ) {
		const p = `${page.path}.json`;

		if ( FindRoutesMatch( p, Routes )) {
			try {
				const r = await this.fetch( p );
				const data = await r.json();
				console.log(`[...slug] ✅ 200 ${Object.keys(data)}`);
				return { conf: { data, page } };
			} catch(err) {
				console.log(`[...slug] ❌ 501 ${err}`);
				this.error( 501, err );
			}
		}
	};
</script>

<script>
	import PDAC from '../pdac/PDAC.svelte'
	export let conf = {
		page: {},
		data: null
	}
</script>

<svelte:head>
	<title>PDAC</title>
</svelte:head>

<PDAC {...conf} />