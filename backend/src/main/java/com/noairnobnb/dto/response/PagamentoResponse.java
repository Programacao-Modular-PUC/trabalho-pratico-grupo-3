package com.noairnobnb.dto.response;

import com.noairnobnb.model.enums.FormaPagamento;
import com.noairnobnb.model.enums.PagamentoStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

public record PagamentoResponse(
    Long id,
    Long aluguelId,
    Long clienteId,
    String clienteNome,
    Long quartoId,
    Long residenciaId,
    BigDecimal valor,
    LocalDateTime dataPagamento,
    PagamentoStatus status,
    FormaPagamento formaPagamento,
    Instant createdAt,
    Instant updatedAt
) {}

