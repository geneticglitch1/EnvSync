package com.envsync.backend;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Integration test — requires the full Docker Compose stack (PostgreSQL, Keycloak).
 * Run with: docker compose up -d && ./mvnw test
 */
@SpringBootTest
@Disabled("Requires running Docker Compose stack (PostgreSQL + Keycloak). Run with integration profile.")
class BackendApplicationTests {

    @Test
    void contextLoads() {
    }
}
