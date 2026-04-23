package com.noairnobnb.dto.request;

import com.noairnobnb.model.enums.TipoCamaCasal;
import com.noairnobnb.model.enums.TipoQuarto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record QuartoCreateRequest(
    @NotNull @Positive Long residenciaId,
    @NotNull TipoQuarto tipoQuarto,
    @NotNull @DecimalMin(value = "0.01") BigDecimal valorBaseDiaria,
    @NotNull Boolean possuiArCondicionado,
    @NotNull Boolean possuiHidromassagem,
    @NotNull Boolean ativo,
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
    Integer famAmbientesDistintos) {}

