package com.amarbold.pwdmanager.pwnguard.account.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    // The Bcrypt-hashed version of "Key A" sent by the browser during login
    @Column(name = "auth_hash", nullable = false)
    private String authHash;

    @Column(name = "crypto_salt", nullable = false, length = 64)
    private String cryptoSalt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UserAccount() {}

    public UserAccount(String email, String authHash, String cryptoSalt) {
        this.email = email;
        this.authHash = authHash;
        this.cryptoSalt = cryptoSalt;
    }

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getAuthHash() { return authHash; }
    public void setAuthHash(String authHash) { this.authHash = authHash; }
    public String getCryptoSalt() { return cryptoSalt; }
}