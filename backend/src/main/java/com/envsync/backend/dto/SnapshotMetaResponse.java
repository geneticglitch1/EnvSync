package com.envsync.backend.dto;

import com.envsync.backend.model.Snapshot;

import java.time.Instant;
import java.util.UUID;

public record SnapshotMetaResponse(
        UUID id,
        int version,
        String message,
        String pushed_by,
        Instant created_at
) {
    public static SnapshotMetaResponse from(Snapshot s) {
        return new SnapshotMetaResponse(s.getId(), s.getVersion(), s.getMessage(), s.getPushedBy(), s.getCreatedAt());
    }
}
