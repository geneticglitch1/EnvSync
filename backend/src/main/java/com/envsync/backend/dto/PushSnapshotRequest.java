package com.envsync.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record PushSnapshotRequest(
        @NotBlank String ciphertext,
        @NotBlank String nonce,
        String message
) {}
