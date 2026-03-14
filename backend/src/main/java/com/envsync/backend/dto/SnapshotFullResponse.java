package com.envsync.backend.dto;

import com.envsync.backend.model.Snapshot;

import java.time.Instant;
import java.util.UUID;

public record SnapshotFullResponse(
        UUID id,
        int version,
        String ciphertext,
        String nonce,
        String message,
        String pushed_by,
        Instant created_at
) {
    public static SnapshotFullResponse from(Snapshot s) {
        return new SnapshotFullResponse(
                s.getId(), s.getVersion(),
                s.getCiphertext(), s.getNonce(),
                s.getMessage(), s.getPushedBy(),
                s.getCreatedAt()
        );
    }
}
