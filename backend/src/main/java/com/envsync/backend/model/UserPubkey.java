package com.envsync.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_pubkeys")
public class UserPubkey {

    /** Keycloak `sub` — primary key (one keypair per user). */
    @Id
    @Column(name = "user_id")
    private String userId;

    /** Base64-encoded X25519 public key. */
    @Column(name = "public_key", nullable = false)
    private String publicKey;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // ── Getters / Setters ──────────────────────────────────────────────────

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPublicKey() { return publicKey; }
    public void setPublicKey(String publicKey) { this.publicKey = publicKey; }

    public Instant getUpdatedAt() { return updatedAt; }
}
