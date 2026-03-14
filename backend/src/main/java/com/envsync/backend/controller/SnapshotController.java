package com.envsync.backend.controller;

import com.envsync.backend.dto.PushSnapshotRequest;
import com.envsync.backend.dto.SnapshotFullResponse;
import com.envsync.backend.dto.SnapshotMetaResponse;
import com.envsync.backend.model.Project;
import com.envsync.backend.model.Snapshot;
import com.envsync.backend.service.ProjectService;
import com.envsync.backend.service.SnapshotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/snapshots")
public class SnapshotController {

    private final ProjectService projectService;
    private final SnapshotService snapshotService;

    public SnapshotController(ProjectService projectService, SnapshotService snapshotService) {
        this.projectService = projectService;
        this.snapshotService = snapshotService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SnapshotMetaResponse push(
            @PathVariable UUID projectId,
            @Valid @RequestBody PushSnapshotRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        Project project = projectService.getForUser(projectId, jwt.getSubject());
        Snapshot snap = snapshotService.push(
                project, req.ciphertext(), req.nonce(), req.message(), jwt.getSubject());
        return SnapshotMetaResponse.from(snap);
    }

    @GetMapping
    public List<SnapshotMetaResponse> list(
            @PathVariable UUID projectId,
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal Jwt jwt) {
        Project project = projectService.getForUser(projectId, jwt.getSubject());
        return snapshotService.list(project, limit)
                .stream()
                .map(SnapshotMetaResponse::from)
                .toList();
    }

    // Note: this must be declared before /{snapId} so Spring MVC matches "latest" as literal
    @GetMapping("/latest")
    public SnapshotFullResponse getLatest(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal Jwt jwt) {
        Project project = projectService.getForUser(projectId, jwt.getSubject());
        return SnapshotFullResponse.from(snapshotService.getLatest(project));
    }

    @GetMapping("/{snapId}")
    public SnapshotFullResponse getById(
            @PathVariable UUID projectId,
            @PathVariable UUID snapId,
            @AuthenticationPrincipal Jwt jwt) {
        Project project = projectService.getForUser(projectId, jwt.getSubject());
        return SnapshotFullResponse.from(snapshotService.getById(project, snapId));
    }
}
