package com.amarbold.pwdmanager.pwnguard.account.repository;

import com.amarbold.pwdmanager.pwnguard.account.model.EncryptedVault;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VaultRepository extends JpaRepository<EncryptedVault, UUID> {
}