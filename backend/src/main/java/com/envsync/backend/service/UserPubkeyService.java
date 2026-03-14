package com.envsync.backend.service;

import com.envsync.backend.model.UserPubkey;
import com.envsync.backend.repository.UserPubkeyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserPubkeyService {

    private final UserPubkeyRepository repo;

    public UserPubkeyService(UserPubkeyRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public void upsert(String userId, String publicKey) {
        UserPubkey entry = repo.findById(userId).orElseGet(UserPubkey::new);
        entry.setUserId(userId);
        entry.setPublicKey(publicKey);
        repo.save(entry);
    }
}
