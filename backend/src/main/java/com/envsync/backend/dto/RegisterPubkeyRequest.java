package com.envsync.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisterPubkeyRequest(@NotBlank String public_key) {}
