package com.envsync.backend.controller;

import com.envsync.backend.dto.CreateProjectRequest;
import com.envsync.backend.dto.ProjectResponse;
import com.envsync.backend.model.Project;
import com.envsync.backend.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponse create(
            @Valid @RequestBody CreateProjectRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        Project project = projectService.create(req.name(), req.environment(), jwt.getSubject());
        return ProjectResponse.from(project);
    }

    @GetMapping
    public List<ProjectResponse> list(@AuthenticationPrincipal Jwt jwt) {
        return projectService.listForUser(jwt.getSubject())
                .stream()
                .map(ProjectResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public ProjectResponse get(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        return ProjectResponse.from(projectService.getForUser(id, jwt.getSubject()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        projectService.delete(id, jwt.getSubject());
    }
}
