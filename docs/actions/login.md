<!--
Sitemap:
- [Introduction](/introduction/about): Learn how OpenSigner solves private key management by splitting keys into shares with Shamir's Secret Sharing for secure, non-custodial wallet recovery.
- [Users](/introduction/users): Understand how OpenSigner manages users, projects, and authentication providers across hot and cold storage for non-custodial key management operations.
- [Setup](/introduction/setup): Set up OpenSigner locally by cloning the repo, building Docker containers with Make, and configuring environment variables for all key management components.
- [Getting started](/introduction/getting-started): Get started with OpenSigner after setup. Launch the iFrame component in your browser, explore the Postman API collection, and begin managing wallet keys.
- [Import shares from Openfort](/introduction/import-share-from-openfort): Migrate user key shares from an Openfort project to a self-hosted OpenSigner instance. Export hot and cold shares, import them, and recover the key.
- [Security overview](/security/overview): Security overview of the OpenSigner trust model covering key share distribution, authentication providers, transport encryption, and TLS requirements.
- [Recovery methods](/security/recovery-methods): Compare OpenSigner recovery methods including password, passkey, and automatic recovery with OTP. Learn encryption details and non-custodial security guarantees.
- [Deployment scenarios](/security/deployment-scenarios): Explore six OpenSigner deployment scenarios from fully self-hosted to fully managed, with security trade-offs and custody implications for each configuration.
- [Threat analysis](/security/threat-analysis): Threat analysis of OpenSigner covering iframe compromise, auth service attacks, token forgery, and storage tampering with detailed mitigations and best practices.
- [System integrity](/security/system-integrity): Verify OpenSigner component integrity using Cosign attestation, Rekor transparency logs, and SHA-256 checksums for client-side iframe asset verification.
- [Create a key](/actions/signup): Step-by-step guide to creating keys in OpenSigner, including Shamir secret splitting across hot and cold storage with password, passkey, or automatic recovery.
- [Recover a key](/actions/login): Learn how OpenSigner recovers private keys on new devices using password, passkey, or automatic recovery with OTP through the iFrame and cold storage workflow.
- [Sign an operation](/actions/operation): Understand how OpenSigner handles transaction signing through ephemeral private key reconstruction inside the iFrame, ensuring keys never persist in memory.
- [Authentication component](/components/auth): Learn about the OpenSigner authentication component that verifies users and issues JWT access tokens for secure hot and cold storage key share retrieval.
- [iFrame component](/components/iframe): Deep dive into the OpenSigner iFrame, the browser-based component that handles private key generation, Shamir share splitting, and ephemeral reconstruction.
- [Hot storage component](/components/hot_storage): Technical guide to the OpenSigner hot storage component for storing frequently accessed key shares, with device linking, JWT auth, and Go implementation.
- [Shield component](/components/shield): Explore the OpenSigner Shield cold storage component built in Go with MySQL, supporting password, passkey, and automatic recovery with OTP for key shares.
- [OTP for automatic recovery](/components/cold_storage/otp): One-Time Password (OTP) verification for automatic recovery adds an additional layer of security when creating encrypted sessions.
- [Postman collection](/apis/postman): Test the OpenSigner components with the official Postman collection, with preconfigured requests for authentication, hot storage, and Shield cold storage.
- [Authentication service API](/apis/auth_service): Complete API reference for the OpenSigner Authentication Service with Swagger documentation for user identity validation, token issuance, and access control.
- [Hot storage API](/apis/hot_storage): Complete API reference for the OpenSigner Hot Storage with Swagger documentation covering device linking and storage of frequently accessed key shares.
- [Cold storage API](/apis/cold_storage): Complete API reference for the OpenSigner Cold Storage (Shield) with Swagger docs covering error codes for OTP, projects, shares, users, and authentication.
- [Non-Custodial Wallet Key Management](/index): OpenSigner is an open-source, self-hostable wallet key management system that issues non-custodial cryptographic keys using Shamir's Secret Sharing scheme.
- [API documentation theme warning](/apis/_components/ui-warning): Important notice regarding Swagger UI theme compatibility and recommended viewing settings.
-->

# Recover a key

Before recovering a key, the user must call hot storage to retrieve their list of accounts and select the one to recover.
Once selected, pass the account UUID to the iFrame, which handles the recovery process.

The process differs depending on the recovery method:

* **Password Recovery**: User provides a password to decrypt the cold share
* **Automatic Recovery**: Cold share is decrypted server-side using project entropy
* **Passkey Recovery**: User authenticates with a passkey to derive the decryption key

## Password recovery

The user recovers the key through the iFrame. The iFrame attempts to reconstruct the key
and fails because the local share is missing. This share is stored on each device after the user recovers it for the first time on that device.

Instead, the iFrame fetches the hot and cold shares with the JWT token it obtains from the auth service,
reconstructs the key, splits it again, and:

* Discards the cold share.
* Stores the local share on the device.
* Stores the hot share in the hot storage.

The diagram below shows this process in detail.

![Login user with password-based recovery](/diagrams/login_new_device_password.svg)

## Automatic recovery

:::info
`Admin` and `User` can be the same entity, though this defeats the purpose of automatic recovery.
Typically, `Admin` is the application developer, and `User` is the end user.
:::

![Login user with automatic recovery](/diagrams/login_new_device_automatic.svg)

The user can now use this device without accessing the cold storage again by using
the local and hot shares to reconstruct the private key. The diagram doesn't show the
private key reconstruction in the cold storage. The following section explains it in detail.

The cold storage has the cold share, but it is encrypted with a key it has no access to.
The key used to encrypt the cold share was split into shares and deleted after its first usage.
The cold storage kept one of these shares, while the admin kept the other share.
When the admin calls the cold storage share retrieval endpoint, it provides
its share as a one-time input for reconstructing the encryption key and decrypting the cold share.

To enforce this one-time usage, the cold storage deletes the encryption key share passed
by the admin after using it once.

![Cold share reconstruction](/diagrams/enc_key_reconstruction.svg)

### OTP with automatic recovery

The flow is the same as automatic recovery above. The only difference is in encrypted session creation—it requires action from the user.
The diagram below shows only the encrypted session creation flow.

![Login user with automatic recovery and OTP](/diagrams/login_new_device_automatic_otp.svg)

As shown in the diagram, the admin must request an OTP for the user before proceeding with encrypted session creation.
If a session is created without the OTP, the cold storage does not return the share to the iFrame, causing the entire key recovery process to fail.

## Passkey recovery

When cold shares are encrypted using passkeys, OpenSigner stores the necessary information for it to know
which passkey it should ask for.

If a user wants to retrieve their cold share, they are prompted to authenticate with the passkey they used to create the account.
Most passkey authentication providers still show some kind of prompt even if they don't find the passkey within the local authenticator, such as a picture with a QR code if the passkey was created using a phone.

Once properly authenticated, no further interaction is required from the user: both the PRF generation and the key derivation/share encryption happen under the hood, leaving the unencrypted cold share available for full key recovery.

## Related

* Start with [Create a key](/actions/signup), then [Sign an operation](/actions/operation).
* Compare the trade-offs in [Recovery methods](/security/recovery-methods).

Passkey recovery is built on [WebAuthn](https://www.w3.org/TR/webauthn-2/); automatic recovery can use a time-based one-time password ([RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)).

<JsonLd data={techArticle({ headline: 'Recover a key', description: 'Learn how OpenSigner recovers private keys on new devices using password, passkey, or automatic recovery with OTP through the iFrame and cold storage workflow.', path: '/actions/login' })} />
