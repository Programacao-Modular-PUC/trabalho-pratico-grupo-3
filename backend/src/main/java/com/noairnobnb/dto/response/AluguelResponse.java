package com.noairnobnb.dto.response;

import com.noairnobnb.model.enums.AluguelStatus;
import com.noairnobnb.model.enums.FormaPagamento;
import com.noairnobnb.model.enums.PagamentoStatus;
import com.noairnobnb.model.enums.TipoQuarto;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

public record AluguelResponse(
    Long id,
    Long clienteId,
    String clienteNome,
    Long quartoId,
    TipoQuarto tipoQuarto,
    Long residenciaId,
    String residenciaEndereco,
    LocalDateTime dataHoraEntrada,
    LocalDateTime dataHoraSaida,
    int numeroDiarias,
    Integer numeroHospedes,
    boolean solicitaBerco,
    BigDecimal valorTotal,
    AluguelStatus status,
    Long pagamentoId,
    PagamentoStatus pagamentoStatus,
    FormaPagamento formaPagamento,
    Instant createdAt,
    Instant updatedAt
) {}

