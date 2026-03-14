package com.envsync.backend.controller;

import com.envsync.backend.dto.RegisterPubkeyRequest;
import com.envsync.backend.service.UserPubkeyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final UserPubkeyService userPubkeyService;

    public UserController(UserPubkeyService userPubkeyService) {
        this.userPubkeyService = userPubkeyService;
    }

    @PutMapping("/pubkey")
    public ResponseEntity<Void> registerPubkey(
            @Valid @RequestBody RegisterPubkeyRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        userPubkeyService.upsert(jwt.getSubject(), req.public_key());
        return ResponseEntity.ok().build();
    }
}
