<script>
  import { user } from '../../stores/user';

  let authed = $user && $user.email !== '';
  const buttonclick = async () => {
    const res = await fetch(`https://local.bubbli.org/api/v1/test`, {
      credentials: 'include'
    });
    if (res.status === 200) {
      res.json().then((data) => {
        console.log(data);
        authed = true;
      });
    } else {
      console.log('failed response. status:', res.status);
    }
  };
</script>

<p>hello</p>
<button class="btn" on:click={buttonclick}>Authenticate!</button>
<p>Authenticated: {authed}</p>
