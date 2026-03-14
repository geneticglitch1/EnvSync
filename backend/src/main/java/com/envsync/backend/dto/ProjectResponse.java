package com.envsync.backend.dto;

import com.envsync.backend.model.Project;

import java.time.Instant;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        String name,
        String environment,
        Instant created_at
) {
    public static ProjectResponse from(Project p) {
        return new ProjectResponse(p.getId(), p.getName(), p.getEnvironment(), p.getCreatedAt());
    }
}
