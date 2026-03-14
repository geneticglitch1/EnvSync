package com.envsync.backend.service;

import com.envsync.backend.model.Project;
import com.envsync.backend.model.Snapshot;
import com.envsync.backend.repository.SnapshotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SnapshotServiceTest {

    @Mock
    private SnapshotRepository snapshotRepository;

    @InjectMocks
    private SnapshotService snapshotService;

    private Project project;

    @BeforeEach
    void setUp() {
        project = new Project();
        project.setName("test-app");
        project.setEnvironment("development");
        project.setOwnerId("user-123");
    }

    @Test
    void push_createsSnapshotWithNextVersion() {
        when(snapshotRepository.findMaxVersionByProject(project)).thenReturn(5);
        Snapshot saved = new Snapshot();
        saved.setVersion(6);
        when(snapshotRepository.save(any(Snapshot.class))).thenReturn(saved);

        Snapshot result = snapshotService.push(project, "ct", "nonce", "init", "user-123");

        assertThat(result.getVersion()).isEqualTo(6);
        verify(snapshotRepository).save(argThat(s ->
                s.getVersion() == 6 &&
                s.getCiphertext().equals("ct") &&
                s.getNonce().equals("nonce") &&
                s.getMessage().equals("init") &&
                s.getPushedBy().equals("user-123")
        ));
    }

    @Test
    void push_firstSnapshot_usesVersion1() {
        when(snapshotRepository.findMaxVersionByProject(project)).thenReturn(0);
        Snapshot saved = new Snapshot();
        saved.setVersion(1);
        when(snapshotRepository.save(any(Snapshot.class))).thenReturn(saved);

        Snapshot result = snapshotService.push(project, "ct", "nonce", null, "user-123");

        assertThat(result.getVersion()).isEqualTo(1);
    }

    @Test
    void getLatest_whenExists_returnsSnapshot() {
        Snapshot snap = new Snapshot();
        snap.setVersion(3);
        when(snapshotRepository.findTopByProjectOrderByVersionDesc(project))
                .thenReturn(Optional.of(snap));

        Snapshot result = snapshotService.getLatest(project);

        assertThat(result.getVersion()).isEqualTo(3);
    }

    @Test
    void getLatest_whenNone_throws404() {
        when(snapshotRepository.findTopByProjectOrderByVersionDesc(project))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> snapshotService.getLatest(project))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("No snapshots found");
    }

    @Test
    void getById_whenBelongsToProject_returnsSnapshot() {
        UUID snapId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();

        // Need to give project an ID for comparison
        Project proj = mock(Project.class);
        when(proj.getId()).thenReturn(projectId);

        Snapshot snap = new Snapshot();
        snap.setProject(proj);
        when(snapshotRepository.findById(snapId)).thenReturn(Optional.of(snap));

        Project requestedProject = mock(Project.class);
        when(requestedProject.getId()).thenReturn(projectId);

        Snapshot result = snapshotService.getById(requestedProject, snapId);
        assertThat(result).isEqualTo(snap);
    }

    @Test
    void getById_whenBelongsToDifferentProject_throws404() {
        UUID snapId = UUID.randomUUID();

        Project proj = mock(Project.class);
        when(proj.getId()).thenReturn(UUID.randomUUID());

        Snapshot snap = new Snapshot();
        snap.setProject(proj);
        when(snapshotRepository.findById(snapId)).thenReturn(Optional.of(snap));

        Project otherProject = mock(Project.class);
        when(otherProject.getId()).thenReturn(UUID.randomUUID());

        assertThatThrownBy(() -> snapshotService.getById(otherProject, snapId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Snapshot not found");
    }

    @Test
    void list_returnsPagedResults() {
        Snapshot s1 = new Snapshot();
        s1.setVersion(2);
        Snapshot s2 = new Snapshot();
        s2.setVersion(1);
        when(snapshotRepository.findByProjectOrderByVersionDesc(eq(project), any(Pageable.class)))
                .thenReturn(List.of(s1, s2));

        List<Snapshot> result = snapshotService.list(project, 10);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getVersion()).isEqualTo(2);
    }
}
