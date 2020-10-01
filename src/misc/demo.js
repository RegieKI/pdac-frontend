
import { Defines as d } from 'svelte-aui/src/index.js'
export default {
	type: d.ROW,
	children: [
	{
		type: d.COL,
		children: [
			{ type: d.BTN },
			{ type: d.RNG },
			{ type: d.DRP },
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
						type: d.SLDR, 
						min: 400,
						max: 587,
						steps:  587 - 400
					},
					{ type: d.AXS },
					{ type: d.TXT }
				]
			},
			{ type: d.RNG }	
		]
	}
	]
}