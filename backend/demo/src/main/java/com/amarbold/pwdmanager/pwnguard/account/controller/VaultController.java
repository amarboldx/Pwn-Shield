package com.amarbold.pwdmanager.pwnguard.account.controller;

import com.amarbold.pwdmanager.pwnguard.account.model.EncryptedVault;
import com.amarbold.pwdmanager.pwnguard.account.model.UserAccount;
import com.amarbold.pwdmanager.pwnguard.account.repository.VaultRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/vault")
public class VaultController {

    private final VaultRepository vaultRepository;

    public VaultController(VaultRepository vaultRepository) {
        this.vaultRepository = vaultRepository;
    }

    @GetMapping("/sync")
    public ResponseEntity<String> getVaultBlob(@AuthenticationPrincipal UserAccount currentUser) {

        Optional<EncryptedVault> vaultOpt = vaultRepository.findById(currentUser.getId());

        return vaultOpt.map(encryptedVault -> ResponseEntity.ok(encryptedVault.getEncryptedBlob())).orElseGet(() -> ResponseEntity.notFound().build());

    }

    @PostMapping("/sync")
    public ResponseEntity<String> saveVaultBlob(
            @AuthenticationPrincipal UserAccount currentUser,
            @RequestBody String newEncryptedBlob) {

        Optional<EncryptedVault> vaultOpt = vaultRepository.findById(currentUser.getId());

        if (vaultOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        EncryptedVault vault = vaultOpt.get();
        vault.setEncryptedBlob(newEncryptedBlob);
        vault.setVersion(vault.getVersion() + 1); // Bump the sync generation

        vaultRepository.save(vault);

        return ResponseEntity.ok("Vault state locked. Generation v" + vault.getVersion());
    }
}