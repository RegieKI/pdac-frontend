<script context="module">

	import Routes from '../server/Routes.js'

	export async function preload( page ) {
		const p = `${page.path}?as=json`;
		console.log(`[Slug] 🌞 attempting JSON: ${p}`)
		try {
			const r = await this.fetch( p );
			if (r.status !== 200) return this.error( r.status, r.statusText );
			const data = await r.json();
			console.log(`[...slug] ✅ 200 ${Object.keys(data)}`);
			return { conf: { data, page } };
		} catch(err) {
			console.log(`[...slug] ❌ 501 ${err}`);
			return this.error( 501, err );
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