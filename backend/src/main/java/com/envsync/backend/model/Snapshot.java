package com.envsync.backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "snapshots")
public class Snapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /** Monotonically increasing per-project version number (1, 2, 3, …). */
    @Column(nullable = false)
    private int version;

    /** Base64-encoded XSalsa20-Poly1305 ciphertext of the vault. */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String ciphertext;

    /** Base64-encoded 24-byte nonce. */
    @Column(nullable = false, length = 64)
    private String nonce;

    @Column
    private String message;

    /** Keycloak `sub` of the user who pushed this snapshot. */
    @Column(name = "pushed_by")
    private String pushedBy;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    // ── Getters / Setters ──────────────────────────────────────────────────

    public UUID getId() { return id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }

    public String getCiphertext() { return ciphertext; }
    public void setCiphertext(String ciphertext) { this.ciphertext = ciphertext; }

    public String getNonce() { return nonce; }
    public void setNonce(String nonce) { this.nonce = nonce; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getPushedBy() { return pushedBy; }
    public void setPushedBy(String pushedBy) { this.pushedBy = pushedBy; }

    public Instant getCreatedAt() { return createdAt; }
}
