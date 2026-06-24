package com.amarbold.pwdmanager.pwnguard.account.repository;

import com.amarbold.pwdmanager.pwnguard.account.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByEmail(String email);
}