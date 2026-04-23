package com.noairnobnb.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

/** Datas são interpretadas como horário local de negócio (Brasil); a regra "futuro" é aplicada no serviço. */
public record ReservaCreateRequest(
    @NotNull @Positive Long quartoId,
    @NotNull LocalDateTime dataHoraEntrada,
    @NotNull LocalDateTime dataHoraSaida,
    Integer numeroHospedes,
    Boolean solicitaBerco) {}

