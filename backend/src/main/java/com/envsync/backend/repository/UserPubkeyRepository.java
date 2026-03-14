package com.envsync.backend.repository;

import com.envsync.backend.model.UserPubkey;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPubkeyRepository extends JpaRepository<UserPubkey, String> {
}
