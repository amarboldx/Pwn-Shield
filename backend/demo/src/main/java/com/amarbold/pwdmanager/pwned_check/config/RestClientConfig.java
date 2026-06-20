package com.amarbold.pwdmanager.pwned_check.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {
    @Bean
    public RestClient hibpRestClient() {
        return RestClient.builder()
                .baseUrl("https://api.pwnedpasswords.com")
                .defaultHeader("User-Agent", "AegisPass-App-Development")
                // You can add more global settings here later, like connection timeouts
                .build();
    }
}
