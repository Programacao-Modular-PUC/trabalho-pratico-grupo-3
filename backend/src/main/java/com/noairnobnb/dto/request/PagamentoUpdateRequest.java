package com.noairnobnb.dto.request;

import com.noairnobnb.model.enums.FormaPagamento;
import com.noairnobnb.model.enums.PagamentoStatus;
import jakarta.validation.constraints.NotNull;

public record PagamentoUpdateRequest(
    @NotNull PagamentoStatus status,
    @NotNull FormaPagamento formaPagamento
) {}

