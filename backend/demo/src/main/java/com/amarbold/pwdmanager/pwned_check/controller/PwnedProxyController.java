package com.amarbold.pwdmanager.pwned_check.controller;


import com.amarbold.pwdmanager.pwned_check.service.HibpClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pwned")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class PwnedProxyController {
    private final HibpClientService hClientService;

    @GetMapping("/range/{prefix}")
    public ResponseEntity<String> checkRange(@PathVariable String prefix) {
        try {
            String suffixList = hClientService.getPasswordHashRange(prefix);
            return ResponseEntity.ok(suffixList);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error proxying request to HIBP API.");
        }
    }

}
