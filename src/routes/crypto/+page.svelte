<script>
	let uuid = crypto.randomUUID();
	console.log( { uuid} );
	// TODO what do about salt and IV
	// let salt = crypto.getRandomValues(new Uint8Array(16));
	let salt = new Uint8Array([21, 234, 113, 115, 68, 8, 118, 255, 122, 34, 33, 174, 57, 244, 122, 40]);
	console.log(salt);
	let iv = crypto.getRandomValues(new Uint8Array(12));
	let password = "default";
	let decryptPassword = "default";
	let message = "a secret message";
	let encryptedMessage = "";
	let encryptedMessageInput = "moiTwApxZXooBgzismOsY+jK+APaQ04ZVnV8o9u64bM=";
	let decryptedMessage = "";

	function getKeyMaterial() {
		const enc = new TextEncoder();
		return crypto.subtle.importKey(
			"raw",
			enc.encode(password),
			"PBKDF2",
			false,
			["deriveBits", "deriveKey"]
		);
	}

	async function getKey() {
		const keyMaterial = await getKeyMaterial();
		const key = await crypto.subtle.deriveKey(
			{
				name: "PBKDF2",
				salt,
				iterations: 100000,
				hash: "SHA-256",
			},
			keyMaterial,
			{ name: "AES-GCM", length: 256 },
			true,
			["encrypt", "decrypt"]
		);

		return key;
	}

	async function encrypt(msg) {
		console.log(typeof(msg));
		const enc = new TextEncoder();
		let plaintext = enc.encode(msg);
		const key = await getKey();

		return crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
	}

	async function onEncrypt () {
		let encodedMessage = await encrypt(message);
		console.log(encodedMessage);
		let base64Message = btoa(String.fromCharCode(...new Uint8Array(encodedMessage)));
		encryptedMessage = base64Message;
	}

	async function decrypt(encMsg) {
		const key = await getKey();
		
		return crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encMsg);
	}
	async function onDecrypt () {
		console.log("base64 encrypted data", encryptedMessageInput);
		const decodedEncryptedMessage = Uint8Array.from(atob(encryptedMessageInput), c => c.charCodeAt(0))
		console.log("raw encrypted data", decodedEncryptedMessage)
		let encodedMsg = await decrypt(decodedEncryptedMessage);
		console.log("encoded decrypted data", encodedMsg);
		const decoder = new TextDecoder();
		decryptedMessage = decoder.decode(encodedMsg);
		console.log("decoded decrypted data", decryptedMessage);
	}
</script>

<svelte:head>
	<title>Crypto</title>
	<meta name="description" content="crypto testing" />
</svelte:head>

<div class="text-column">
	<h1>Crypto tests</h1>

	<p>{uuid}</p>
	<h2>Encryption</h2>
	<input type="password" bind:value={password} />
	<input type="text" bind:value={message} />

	<button type="button" on:click={onEncrypt}>encrypt</button>

	<p>{encryptedMessage}</p>

	<h2>Decryption</h2>
	<input type="password" bind:value={decryptPassword} />
	<input type="text" bind:value={encryptedMessageInput} />
	<button type="button" on:click={onDecrypt}>Decrypt</button>

	<p>{decryptedMessage}</p>
</div>
