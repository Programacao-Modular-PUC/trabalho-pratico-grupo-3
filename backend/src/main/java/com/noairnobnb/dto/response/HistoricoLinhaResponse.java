package com.noairnobnb.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

public record HistoricoLinhaResponse(
    String tipo,
    Long id,
    String status,
    LocalDateTime periodoInicio,
    LocalDateTime periodoFim,
    BigDecimal valor,
    Long quartoId,
    String residenciaResumo,
    Instant registradoEm
) {}
