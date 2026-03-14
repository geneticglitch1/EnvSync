package com.envsync.backend.service;

import com.envsync.backend.model.Project;
import com.envsync.backend.model.Snapshot;
import com.envsync.backend.repository.SnapshotRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class SnapshotService {

    private final SnapshotRepository snapshotRepository;

    public SnapshotService(SnapshotRepository snapshotRepository) {
        this.snapshotRepository = snapshotRepository;
    }

    @Transactional
    public Snapshot push(Project project, String ciphertext, String nonce,
                         String message, String pushedBy) {
        int nextVersion = snapshotRepository.findMaxVersionByProject(project) + 1;

        Snapshot snap = new Snapshot();
        snap.setProject(project);
        snap.setVersion(nextVersion);
        snap.setCiphertext(ciphertext);
        snap.setNonce(nonce);
        snap.setMessage(message);
        snap.setPushedBy(pushedBy);
        return snapshotRepository.save(snap);
    }

    public Snapshot getLatest(Project project) {
        return snapshotRepository.findTopByProjectOrderByVersionDesc(project)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No snapshots found"));
    }

    public List<Snapshot> list(Project project, int limit) {
        return snapshotRepository.findByProjectOrderByVersionDesc(
                project, PageRequest.of(0, limit));
    }

    public Snapshot getById(Project project, UUID snapId) {
        Snapshot snap = snapshotRepository.findById(snapId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Snapshot not found"));
        if (!snap.getProject().getId().equals(project.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Snapshot not found");
        }
        return snap;
    }
}
