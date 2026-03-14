package com.envsync.backend.service;

import com.envsync.backend.model.Project;
import com.envsync.backend.repository.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Transactional
    public Project create(String name, String environment, String ownerId) {
        Project project = new Project();
        project.setName(name);
        project.setEnvironment(environment);
        project.setOwnerId(ownerId);
        return projectRepository.save(project);
    }

    public List<Project> listForUser(String ownerId) {
        return projectRepository.findByOwnerId(ownerId);
    }

    public Project getForUser(UUID id, String ownerId) {
        return projectRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    @Transactional
    public void delete(UUID id, String ownerId) {
        Project project = getForUser(id, ownerId);
        projectRepository.delete(project);
    }
}
