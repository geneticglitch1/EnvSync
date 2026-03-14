package com.envsync.backend.repository;

import com.envsync.backend.model.Project;
import com.envsync.backend.model.Snapshot;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SnapshotRepository extends JpaRepository<Snapshot, UUID> {

    Optional<Snapshot> findTopByProjectOrderByVersionDesc(Project project);

    List<Snapshot> findByProjectOrderByVersionDesc(Project project, Pageable pageable);

    @Query("SELECT COALESCE(MAX(s.version), 0) FROM Snapshot s WHERE s.project = :project")
    int findMaxVersionByProject(@Param("project") Project project);
}
