package com.noairnobnb.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.noairnobnb.exception.DataInvalidaException;
import com.noairnobnb.testutil.TestPricingProperties;
import com.noairnobnb.service.impl.DailyCalculatorServiceImpl;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class DailyCalculatorServiceTest {
  private final DailyCalculatorService sut = new DailyCalculatorServiceImpl(TestPricingProperties.padrao());

  @Test
  void entrada10_saida10_mesmoDiaSeguinte_1Diaria() {
    var in = LocalDateTime.of(2026, 4, 14, 10, 0);
    var out = LocalDateTime.of(2026, 4, 15, 10, 0);
    assertThat(sut.calcularNumeroDiarias(in, out)).isEqualTo(1);
  }

  @Test
  void entrada13_saida10_mesmoDiaSeguinte_1Diaria() {
    var in = LocalDateTime.of(2026, 4, 14, 13, 0);
    var out = LocalDateTime.of(2026, 4, 15, 10, 0);
    assertThat(sut.calcularNumeroDiarias(in, out)).isEqualTo(1);
  }

  @Test
  void entrada10_saida13_mesmoDiaSeguinte_2Diarias() {
    var in = LocalDateTime.of(2026, 4, 14, 10, 0);
    var out = LocalDateTime.of(2026, 4, 15, 13, 0);
    assertThat(sut.calcularNumeroDiarias(in, out)).isEqualTo(2);
  }

  @Test
  void entrada13_saida13_mesmoDiaSeguinte_2Diarias() {
    var in = LocalDateTime.of(2026, 4, 14, 13, 0);
    var out = LocalDateTime.of(2026, 4, 15, 13, 0);
    assertThat(sut.calcularNumeroDiarias(in, out)).isEqualTo(2);
  }

  @Test
  void exatamenteMeioDia_naoContaComoDepoisDas12h() {
    var in = LocalDateTime.of(2026, 4, 14, 12, 0);
    var out = LocalDateTime.of(2026, 4, 15, 12, 0);
    assertThat(sut.calcularNumeroDiarias(in, out)).isEqualTo(1);
  }

  @Test
  void estadiaLonga_mesmoHorario_fixaComportamentoRegra12h() {
    var in = LocalDateTime.of(2026, 4, 14, 10, 0);
    var out = LocalDateTime.of(2026, 4, 17, 10, 0);
    assertThat(sut.calcularNumeroDiarias(in, out)).isEqualTo(4);
  }

  @Test
  void saidaNaoPosteriorEntrada_lancaDataInvalida() {
    var in = LocalDateTime.of(2026, 4, 14, 10, 0);
    assertThatThrownBy(() -> sut.calcularNumeroDiarias(in, in))
        .isInstanceOf(DataInvalidaException.class)
        .hasFieldOrPropertyWithValue("code", "DATA_INVALIDA");
  }
}
