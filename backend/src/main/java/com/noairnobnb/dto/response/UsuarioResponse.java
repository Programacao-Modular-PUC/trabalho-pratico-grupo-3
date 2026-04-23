package com.noairnobnb.dto.response;

import java.time.Instant;
import java.util.Set;

public record UsuarioResponse(
    Long id,
    String email,
    boolean ativo,
    Set<String> roles,
    Instant createdAt,
    Instant updatedAt
) {}

