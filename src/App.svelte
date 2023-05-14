<!-- App.svelte -->
<script>
    import { Router, Link, Route } from 'svelte-routing';
    import LinkComponent from './routes/link/[color]/+page.svelte';
  </script>
  
  <Router>
    <Route path="/link/:myParam/:test" let:params={test} component={LinkComponent} />
  </Router>
  