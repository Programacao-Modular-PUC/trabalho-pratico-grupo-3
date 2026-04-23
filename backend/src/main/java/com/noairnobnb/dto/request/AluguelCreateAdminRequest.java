package com.noairnobnb.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record AluguelCreateAdminRequest(
    @NotNull @Positive Long clienteId,
    @NotNull @Positive Long quartoId,
    @NotNull LocalDateTime dataHoraEntrada,
    @NotNull LocalDateTime dataHoraSaida,
    Integer numeroHospedes,
    Boolean solicitaBerco) {}
