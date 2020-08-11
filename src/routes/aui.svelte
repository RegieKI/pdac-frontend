<script>
	import { AUI } from '../svelte-aui/src/index.js'
	import { Defines as d } from '../svelte-aui/src/index.js'
	const a = {
		width: "100vw",
		height: "100vh",
		type: d.ROW,
		children: [
		{
			type: d.COL,
			children: [
				{ type: d.BTN },
				{ type: d.RNG },
				{ type: d.IDX },
				{ type: d.TXT },
				{
					type: d.ROW,
					children: [
						{ type: d.TOG },
						{ type: d.BTN },
						{ type: d.BTN }
					]
				},
				{
					type: d.COL,
					children: [
						{ 
							type: d.COL,
							children: [
								{
									type: d.COL,
									children: [
										{ 
											type: d.SLDR, 
											min: 400,
											max: 587,
											steps:  587 - 400
										},
										{ type: d.AXS },
										{ type: d.TXT }
									]
								}
							]
						}
					]
				},
				{ type: d.RNG }	
			]
		},

		{
			type: d.COL,
			children: [

				{
					type: d.MTX,
					variant: d.MTX_TOG
				},
				{
					type: d.SLDR
				},
				{
					type: d.SLDR
				},
				{
					type: d.COL,
					children: [
						{ type: d.BTN },
						{ type: d.BTN },
						{ type: d.BTN },
						{ type: d.BTN },
						{ type: d.BTN },
						{ type: d.BTN }
					]
				},
				{
					type: d.SLDR
				},
				{
					type: d.SLDR
				},
				{ type: d.SLDR },
				{ type: d.BTN },
				{ type: d.SLDR },
				{ type: d.BTN },
				{ type: d.SLDR },
				{ type: d.BTN },
				{ type: d.SLDR },
				{ type: d.BTN },
				{ type: d.SLDR },
				{ type: d.BTN },
				{ type: d.SLDR },
				{ type: d.BTN },
				{ type: d.SLDR },
				{ type: d.BTN },
				{ type: d.SLDR },
				{ type: d.BTN },
				{ type: d.SLDR },
				{ type: d.BTN },
				{ type: d.SLDR },
				{ type: d.BTN },
				{ type: d.SLDR },
				{ type: d.BTN },
				{ type: d.SLDR },
				{ type: d.BTN },
				{ type: d.SLDR },
				{ type: d.BTN },
				{ type: d.SLDR },
				{ type: d.BTN }
			]
		}
		]
	}
</script>

<svelte:head>
	<title>PDAC</title>
</svelte:head>

<AUI {a} />
