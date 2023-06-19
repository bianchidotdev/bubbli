<script lang="ts">
    import { goto } from '$app/navigation';
    import { BASE_API_URI } from '$lib/constants';

    let email = "",
        challenge: string,
        salt: string,
        error: string | null;

    const submitForm = async () => {
        await fetch(`${BASE_API_URI}/registration/start`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email
            })
        })
            .then((response) => {
                if (response.status === 200) {
                    // notificationData.set('Registration successful. Login now.');
                    response.json().then((data) => {
                        console.log(data);
                        challenge = data.challenge;
                        salt = data.salt;
                    })
                } else if (response.status === 400) {
                    console.log(response.json());
                } else {
                    console.log(response.json());
                }
            })
            .catch((error) => {
                error = error;
                console.error('Error:', error);
            });
    };
</script>


<svelte:head>
    <title>Register</title>
    <meta name="description" content="User Registration" />
</svelte:head>

<section class="container">
    <h1>Register</h1>
    {#if error}
        <p class="center error">{error}</p>
    {/if}

    <form class="form" on:submit|preventDefault={submitForm}>
        <input
                bind:value={email}
                name="email"
                type="email"
                aria-label="Email address"
                placeholder="Email address"
        />
        <button class="btn" type="submit">Register</button>
        <p>Challenge: {challenge}</p>
        <p>Salt: {salt}</p>
        <p class="center">Already a user? <a href="/register">Login</a>.</p>
    </form>
</section>
