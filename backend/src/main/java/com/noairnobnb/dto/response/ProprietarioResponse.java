package com.noairnobnb.dto.response;

import java.time.Instant;

public record ProprietarioResponse(
    Long id,
    Long usuarioId,
    String nome,
    String telefone,
    String email,
    Instant createdAt,
    Instant updatedAt
) {}

