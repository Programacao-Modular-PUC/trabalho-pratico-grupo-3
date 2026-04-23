package com.noairnobnb.dto.response;

import java.time.Instant;

public record ClienteResponse(
    Long id,
    Long usuarioId,
    String nome,
    String cpf,
    String endereco,
    String telefone,
    String email,
    Instant createdAt,
    Instant updatedAt
) {}

