package com.envsync.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class test {

    @GetMapping("/api/secure")
    public String secure() {
        //send json response
        return "{\"message\": \"This is a secure endpoint!\"}";
    }
}