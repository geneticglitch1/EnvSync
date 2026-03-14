package com.envsync.backend.service;

import com.envsync.backend.model.Project;
import com.envsync.backend.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectService projectService;

    private Project sampleProject;
    private final String ownerId = "user-123";

    @BeforeEach
    void setUp() {
        sampleProject = new Project();
        sampleProject.setName("test-app");
        sampleProject.setEnvironment("development");
        sampleProject.setOwnerId(ownerId);
    }

    @Test
    void create_savesAndReturnsProject() {
        when(projectRepository.save(any(Project.class))).thenReturn(sampleProject);

        Project result = projectService.create("test-app", "development", ownerId);

        assertThat(result.getName()).isEqualTo("test-app");
        assertThat(result.getEnvironment()).isEqualTo("development");
        assertThat(result.getOwnerId()).isEqualTo(ownerId);
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void listForUser_returnsUserProjects() {
        when(projectRepository.findByOwnerId(ownerId)).thenReturn(List.of(sampleProject));

        List<Project> result = projectService.listForUser(ownerId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("test-app");
    }

    @Test
    void getForUser_whenFound_returnsProject() {
        UUID id = UUID.randomUUID();
        when(projectRepository.findByIdAndOwnerId(id, ownerId)).thenReturn(Optional.of(sampleProject));

        Project result = projectService.getForUser(id, ownerId);

        assertThat(result).isEqualTo(sampleProject);
    }

    @Test
    void getForUser_whenNotFound_throws404() {
        UUID id = UUID.randomUUID();
        when(projectRepository.findByIdAndOwnerId(id, ownerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getForUser(id, ownerId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Project not found");
    }

    @Test
    void delete_whenFound_deletesProject() {
        UUID id = UUID.randomUUID();
        when(projectRepository.findByIdAndOwnerId(id, ownerId)).thenReturn(Optional.of(sampleProject));

        projectService.delete(id, ownerId);

        verify(projectRepository, times(1)).delete(sampleProject);
    }

    @Test
    void delete_whenNotFound_throws404() {
        UUID id = UUID.randomUUID();
        when(projectRepository.findByIdAndOwnerId(id, ownerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.delete(id, ownerId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Project not found");
        verify(projectRepository, never()).delete(any());
    }
}
