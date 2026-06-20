package com.amarbold.pwdmanager.pwned_check.service;


import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class HibpClientService {

    private final RestClient hibpRestClient;

    // Spring Boot automatically finds the 'hibpRestClient' Bean we just configured and injects it here
    public HibpClientService(RestClient hibpRestClient) {
        this.hibpRestClient = hibpRestClient;
    }

    public String getPasswordHashRange(String prefix) {
        if (prefix == null || prefix.length() != 5) {
            throw new IllegalArgumentException("Prefix must be exactly 5 characters long.");
        }

        return this.hibpRestClient.get()
                .uri("/range/{prefix}", prefix)
                .retrieve()
                .body(String.class);
    }
}

