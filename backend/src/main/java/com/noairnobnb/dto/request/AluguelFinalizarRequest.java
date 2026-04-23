package com.noairnobnb.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record AluguelFinalizarRequest(
    @NotNull LocalDateTime dataHoraSaida
) {}

