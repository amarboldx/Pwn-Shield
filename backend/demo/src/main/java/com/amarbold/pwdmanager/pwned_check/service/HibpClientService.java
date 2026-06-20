package com.amarbold.pwdmanager.pwned_check.service;


import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class HibpClientService {
    private final RestClient restClient;

    public HibpClientService() {
        // Initialize the modern Spring 6 / Boot 3+ fluent REST client
        this.restClient = RestClient.builder()
                .baseUrl("https://api.pwnedpasswords.com")
                .defaultHeader("User-Agent", "Pwn-Shield-App-Development")
                .build();
    }

    public String getPasswordHashRange(String prefix) {
        if (prefix == null || prefix.length() != 5) {
            throw new IllegalArgumentException("Prefix must be exactly 5 characters long.");
        }

        return this.restClient.get()
                .uri("/range/{prefix}", prefix)
                .retrieve()
                .body(String.class);
    }
}
