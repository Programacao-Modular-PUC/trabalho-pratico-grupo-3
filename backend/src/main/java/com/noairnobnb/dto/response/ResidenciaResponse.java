package com.noairnobnb.dto.response;

import java.time.Instant;

public record ResidenciaResponse(
    Long id,
    Long proprietarioId,
    String proprietarioNome,
    String endereco,
    String numero,
    String bairro,
    String cep,
    String telefone,
    String email,
    Instant createdAt,
    Instant updatedAt
) {}

