package com.noairnobnb.dto.response;

import com.noairnobnb.model.enums.FormaPagamento;
import com.noairnobnb.model.enums.PagamentoStatus;
import com.noairnobnb.model.enums.TipoQuarto;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReciboResponse(
    Long aluguelId,
    LocalDateTime dataHoraEntrada,
    LocalDateTime dataHoraSaida,
    int numeroDiarias,
    Integer numeroHospedes,
    boolean solicitaBerco,
    BigDecimal totalAPagar,
    Long clienteId,
    String clienteNome,
    String clienteEmail,
    Long quartoId,
    TipoQuarto tipoQuarto,
    boolean possuiArCondicionado,
    boolean possuiHidromassagem,
    Long residenciaId,
    String residenciaEndereco,
    String residenciaNumero,
    String residenciaBairro,
    String residenciaCep,
    Long pagamentoId,
    BigDecimal valorPagamento,
    PagamentoStatus statusPagamento,
    FormaPagamento formaPagamento
) {}

