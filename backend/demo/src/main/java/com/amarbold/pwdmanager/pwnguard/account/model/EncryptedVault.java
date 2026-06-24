package com.amarbold.pwdmanager.pwnguard.account.model;

import com.amarbold.pwdmanager.pwnguard.account.model.UserAccount;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_vaults")
public class EncryptedVault {

    @Id
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private UserAccount user;

    // The giant Base64 AES-GCM ball containing all their passwords
    @Column(name = "encrypted_blob", nullable = false, columnDefinition = "TEXT")
    private String encryptedBlob;

    // Used for "Optimistic Locking" to prevent two devices syncing over each other
    @Column(nullable = false)
    private Integer version = 1;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public EncryptedVault() {}

    public EncryptedVault(UserAccount user, String encryptedBlob) {
        this.user = user;
        this.encryptedBlob = encryptedBlob;
    }


    public UUID getUserId() { return userId; }
    public UserAccount getUser() { return user; }
    public String getEncryptedBlob() { return encryptedBlob; }

    public void setEncryptedBlob(String encryptedBlob) {
        this.encryptedBlob = encryptedBlob;
        this.updatedAt = Instant.now();
    }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}