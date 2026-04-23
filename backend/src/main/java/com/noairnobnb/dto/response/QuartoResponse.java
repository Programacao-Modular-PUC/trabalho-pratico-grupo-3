package com.noairnobnb.dto.response;

import com.noairnobnb.model.enums.TipoCamaCasal;
import com.noairnobnb.model.enums.TipoQuarto;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record QuartoResponse(
    Long id,
    Long residenciaId,
    String residenciaEndereco,
    String residenciaNumero,
    Long proprietarioId,
    String proprietarioNome,
    TipoQuarto tipoQuarto,
    BigDecimal valorBaseDiaria,
    boolean possuiArCondicionado,
    boolean possuiHidromassagem,
    boolean ativo,
    Integer numCamasSolteiro,
    BigDecimal adicionalDiariaPorCamaExtra,
    TipoCamaCasal tipoCamaCasal,
    Boolean permiteBerco,
    BigDecimal taxaDiariaBerco,
    BigDecimal adicionalConfortoCamaComum,
    BigDecimal adicionalConfortoQueenKing,
    Integer famCamasSolteiro,
    Integer famCamaCasalComum,
    Integer famCamaCasalGrande,
    Integer famAmbientesDistintos,
    Integer capacidadeMaximaHospedes,
    List<QuartoImagemResponse> imagens,
    Instant createdAt,
    Instant updatedAt) {}

