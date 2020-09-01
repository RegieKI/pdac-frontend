<script>
  import { info, overlay, previousPage } from './../pdac/Store.js'
  import { goto, stores } from '@sapper/app';
  const { page } = stores();

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    page.subscribe(({ path, params, query }) => {
      console.log('ON PAGE CHANGE', path, window.location.pathname);
      previousPage.set( window.location.pathname );
    }) 
  }


</script>

<main>	
	<slot></slot>
</main>