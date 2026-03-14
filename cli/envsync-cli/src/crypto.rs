use argon2::{Algorithm, Argon2, Params, Version};
use sodiumoxide::crypto::{box_, secretbox};

use crate::error::EnvSyncError;

/// Derive a 32-byte vault key from a passphrase using Argon2id.
pub fn derive_key(passphrase: &str, salt: &[u8; 32]) -> Result<[u8; 32], EnvSyncError> {
    let params = Params::new(65536, 3, 1, Some(32))
        .map_err(|e| EnvSyncError::CryptoError(e.to_string()))?;
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    let mut key = [0u8; 32];
    argon2
        .hash_password_into(passphrase.as_bytes(), salt, &mut key)
        .map_err(|e| EnvSyncError::CryptoError(e.to_string()))?;
    Ok(key)
}

/// Generate a random 32-byte Argon2id salt.
pub fn generate_salt() -> [u8; 32] {
    let mut salt = [0u8; 32];
    sodiumoxide::randombytes::randombytes_into(&mut salt);
    salt
}

/// Generate an X25519 keypair.
pub fn generate_keypair() -> (box_::PublicKey, box_::SecretKey) {
    box_::gen_keypair()
}

/// Encrypt plaintext with XSalsa20-Poly1305.  Returns (ciphertext, nonce).
pub fn encrypt_vault(
    plaintext: &[u8],
    key: &[u8; 32],
) -> Result<(Vec<u8>, secretbox::Nonce), EnvSyncError> {
    let sk = secretbox::Key::from_slice(key)
        .ok_or_else(|| EnvSyncError::CryptoError("Invalid vault key length".to_string()))?;
    let nonce = secretbox::gen_nonce();
    let ciphertext = secretbox::seal(plaintext, &nonce, &sk);
    Ok((ciphertext, nonce))
}

/// Decrypt ciphertext produced by `encrypt_vault`.
pub fn decrypt_vault(
    ciphertext: &[u8],
    nonce: &secretbox::Nonce,
    key: &[u8; 32],
) -> Result<Vec<u8>, EnvSyncError> {
    let sk = secretbox::Key::from_slice(key)
        .ok_or_else(|| EnvSyncError::CryptoError("Invalid vault key length".to_string()))?;
    secretbox::open(ciphertext, nonce, &sk)
        .map_err(|_| EnvSyncError::CryptoError("Decryption failed — wrong passphrase?".to_string()))
}

/// Encrypt an X25519 private key with the master key.
pub fn encrypt_privkey(
    privkey: &box_::SecretKey,
    master_key: &[u8; 32],
) -> Result<(Vec<u8>, secretbox::Nonce), EnvSyncError> {
    encrypt_vault(&privkey.0, master_key)
}

/// Decrypt an X25519 private key with the master key.
pub fn decrypt_privkey(
    ct: &[u8],
    nonce: &secretbox::Nonce,
    master_key: &[u8; 32],
) -> Result<box_::SecretKey, EnvSyncError> {
    let bytes = decrypt_vault(ct, nonce, master_key)?;
    box_::SecretKey::from_slice(&bytes)
        .ok_or_else(|| EnvSyncError::CryptoError("Invalid private key length".to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn roundtrip_vault() {
        sodiumoxide::init().unwrap();
        let passphrase = "test-passphrase";
        let salt = generate_salt();
        let key = derive_key(passphrase, &salt).unwrap();
        let plaintext = b"FOO=bar\nDB=postgres://localhost/test";
        let (ct, nonce) = encrypt_vault(plaintext, &key).unwrap();
        let decrypted = decrypt_vault(&ct, &nonce, &key).unwrap();
        assert_eq!(decrypted, plaintext);
    }

    #[test]
    fn wrong_passphrase_fails() {
        sodiumoxide::init().unwrap();
        let salt = generate_salt();
        let key = derive_key("correct", &salt).unwrap();
        let (ct, nonce) = encrypt_vault(b"secret", &key).unwrap();
        let wrong_key = derive_key("wrong", &salt).unwrap();
        assert!(decrypt_vault(&ct, &nonce, &wrong_key).is_err());
    }

    #[test]
    fn roundtrip_privkey() {
        sodiumoxide::init().unwrap();
        let salt = generate_salt();
        let master_key = derive_key("passphrase", &salt).unwrap();
        let (_, sec) = generate_keypair();
        let (ct, nonce) = encrypt_privkey(&sec, &master_key).unwrap();
        let recovered = decrypt_privkey(&ct, &nonce, &master_key).unwrap();
        assert_eq!(sec.0, recovered.0);
    }
}
