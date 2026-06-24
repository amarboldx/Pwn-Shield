package com.amarbold.pwdmanager.pwnguard.account.controller;

import com.amarbold.pwdmanager.pwnguard.account.dto.AuthHandshakeRequest;
import com.amarbold.pwdmanager.pwnguard.account.dto.SaltResponse;
import com.amarbold.pwdmanager.pwnguard.account.model.EncryptedVault;
import com.amarbold.pwdmanager.pwnguard.account.model.UserAccount;
import com.amarbold.pwdmanager.pwnguard.account.repository.UserRepository;
import com.amarbold.pwdmanager.pwnguard.account.repository.VaultRepository;
import com.amarbold.pwdmanager.pwnguard.security.service.JwtService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final VaultRepository vaultRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    public AuthController(UserRepository userRepository, VaultRepository vaultRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.vaultRepository = vaultRepository;
        this.jwtService = jwtService;
    }

    /**
     * STEP 1 OF LOGIN: The Salt Request
     * Browser asks for the user's specific Argon2 salt so it can derive Key A & B.
     */
    @GetMapping("/salt")
    public ResponseEntity<SaltResponse> getSalt(@RequestParam String email) {
        String cleanEmail = email.toLowerCase().trim();
        Optional<UserAccount> userOpt = userRepository.findByEmail(cleanEmail);

        String salt;
        if (userOpt.isPresent()) {
            salt = userOpt.get().getCryptoSalt();
        } else {
            // ANTI-ENUMERATION TRAP: Generate a stable, real-looking dummy salt
            // so an attacker cannot tell if this email exists in our DB or not.
            salt = "pg_dummy_" + Integer.toHexString(cleanEmail.hashCode());
        }

        return ResponseEntity.ok(new SaltResponse(salt));
    }

    /**
     * STEP 2 OF LOGIN: The Handshake
     * Browser presents the derived "Key A". We test it against our stored Bcrypt hash.
     */
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthHandshakeRequest req) {
        Optional<UserAccount> userOpt = userRepository.findByEmail(req.email().toLowerCase().trim());

        if (userOpt.isEmpty() || !passwordEncoder.matches(req.authKeyHex(), userOpt.get().getAuthHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid master credentials.");
        }

        UserAccount user = userOpt.get();
        String jwt = jwtService.generateToken(user);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtService.generateJwtCookie(jwt).toString())
                .body("Handshake authorized. Vault unlocked.");
    }

    /**
     * SIGNUP
     */
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody AuthHandshakeRequest req) {
        String cleanEmail = req.email().toLowerCase().trim();
        if (userRepository.findByEmail(cleanEmail).isPresent()) {
            return ResponseEntity.badRequest().body("Identity overlap registered.");
        }

        // Generate a 64-character true cryptographically random hex salt
        SecureRandom random = new SecureRandom();
        byte[] saltBytes = new byte[32];
        random.nextBytes(saltBytes);
        String cryptoSalt = HexFormat.of().formatHex(saltBytes);

        // Bcrypt hash the incoming "Key A"
        String bcryptedKeyA = passwordEncoder.encode(req.authKeyHex());

        UserAccount newUser = new UserAccount(cleanEmail, bcryptedKeyA, cryptoSalt);
        userRepository.save(newUser);

        // Provision an empty Base64 vault row tied to this user's primary key
        // (A Base64 string of an AES-GCM encrypted empty JSON array "[]")
        EncryptedVault emptyVault = new EncryptedVault(newUser, "EMPTY_VAULT_INITIALIZED");
        vaultRepository.save(emptyVault);

        String jwt = jwtService.generateToken(newUser);

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, jwtService.generateJwtCookie(jwt).toString())
                .body("Identity established. Vault provisioned.");
    }
}