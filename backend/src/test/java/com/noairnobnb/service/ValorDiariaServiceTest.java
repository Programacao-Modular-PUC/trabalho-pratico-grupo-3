package com.noairnobnb.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.noairnobnb.model.HospedagemCotacao;
import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.model.enums.TipoCamaCasal;
import com.noairnobnb.model.enums.TipoQuarto;
import com.noairnobnb.service.impl.ValorDiariaServiceImpl;
import com.noairnobnb.service.pricing.ExtrasDiariaPricingStrategy;
import com.noairnobnb.service.pricing.RegrasEspecificasTipoQuartoDiariaStrategy;
import com.noairnobnb.testutil.TestPricingProperties;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ValorDiariaServiceTest {

  private ValorDiariaService sut;

  @BeforeEach
  void setUp() {
    var props = TestPricingProperties.padrao();
    sut =
        new ValorDiariaServiceImpl(
            List.of(
                new RegrasEspecificasTipoQuartoDiariaStrategy(props),
                new ExtrasDiariaPricingStrategy(props)));
  }

  @Test
  void individual_camaExtra_acrescentaAdicionalPorCama() {
    var q = baseQuarto(TipoQuarto.INDIVIDUAL);
    q.setNumCamasSolteiro(2);
    q.setAdicionalDiariaPorCamaExtra(new BigDecimal("25.00"));

    var valor = sut.calcularValorDiaria(q);

    assertThat(valor).isEqualByComparingTo("125.00");
  }

  @Test
  void casal_camaComum_aplicaConfortoSemBerco() {
    var q = baseQuarto(TipoQuarto.CASAL);
    q.setTipoCamaCasal(TipoCamaCasal.COMUM);
    q.setAdicionalConfortoCamaComum(new BigDecimal("30.00"));
    q.setPermiteBerco(false);

    var valor = sut.calcularValorDiaria(q, new HospedagemCotacao(2, false));

    assertThat(valor).isEqualByComparingTo("130.00");
  }

  @Test
  void casal_comBerco_somaTaxaDiariaBerco() {
    var q = baseQuarto(TipoQuarto.CASAL);
    q.setTipoCamaCasal(TipoCamaCasal.COMUM);
    q.setPermiteBerco(true);
    q.setTaxaDiariaBerco(new BigDecimal("40.00"));

    var valor = sut.calcularValorDiaria(q, new HospedagemCotacao(2, true));

    assertThat(valor).isEqualByComparingTo("140.00");
  }

  @Test
  void familia_tresHospedes_aplicaAcrescimoEDescontoGrupo() {
    var q = baseQuarto(TipoQuarto.FAMILIA);
    q.setFamCamasSolteiro(2);
    q.setFamCamaCasalComum(1);
    q.setFamAmbientesDistintos(2);

    var valor = sut.calcularValorDiaria(q, new HospedagemCotacao(3, false));

    // base 100 * (1 + 0.04*2) + 12*2, desconto 3º hóspede
    assertThat(valor).isEqualByComparingTo("129.36");
  }

  @Test
  void extras_arCondicionadoEHidro_aplicamPercentuais() {
    var q = baseQuarto(TipoQuarto.INDIVIDUAL);
    q.setPossuiArCondicionado(true);
    q.setPossuiHidromassagem(true);

    var valor = sut.calcularValorDiaria(q);

    // 100 * 1.45
    assertThat(valor).isEqualByComparingTo("145.00");
  }

  private static Quarto baseQuarto(TipoQuarto tipo) {
    var q = new Quarto();
    q.setTipoQuarto(tipo);
    q.setValorBaseDiaria(new BigDecimal("100.00"));
    q.setPossuiArCondicionado(false);
    q.setPossuiHidromassagem(false);
    return q;
  }
}
