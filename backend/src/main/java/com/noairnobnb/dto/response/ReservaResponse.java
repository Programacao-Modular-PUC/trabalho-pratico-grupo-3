package com.noairnobnb.dto.response;

import com.noairnobnb.model.enums.ReservaStatus;
import com.noairnobnb.model.enums.TipoQuarto;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

public record ReservaResponse(
    Long id,
    Long clienteId,
    String clienteNome,
    Long quartoId,
    TipoQuarto tipoQuarto,
    Long residenciaId,
    String residenciaEndereco,
    LocalDateTime dataHoraEntrada,
    LocalDateTime dataHoraSaida,
    ReservaStatus status,
    Integer numeroHospedes,
    boolean solicitaBerco,
    BigDecimal valorPrevisto,
    Instant createdAt,
    Instant updatedAt
) {}

