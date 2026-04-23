package com.noairnobnb.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.noairnobnb.config.NoAirNoBnbProperties;
import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.service.impl.DailyCalculatorServiceImpl;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class DailyCalculatorServiceTest {
  private final DailyCalculatorService sut =
      new DailyCalculatorServiceImpl(
          new NoAirNoBnbProperties(
              new NoAirNoBnbProperties.Security(new NoAirNoBnbProperties.Security.Jwt("x", "y", 60)),
              new NoAirNoBnbProperties.Business(
                  new NoAirNoBnbProperties.Business.Diaria(12, 12),
                  new NoAirNoBnbProperties.Business.Pricing(
                      new NoAirNoBnbProperties.Business.Pricing.Extras(
                          java.math.BigDecimal.ZERO, java.math.BigDecimal.ZERO),
                      new NoAirNoBnbProperties.Business.Pricing.Familia(
                          java.math.BigDecimal.valueOf(0.04),
                          java.math.BigDecimal.valueOf(12),
                          java.math.BigDecimal.valueOf(0.02),
                          java.math.BigDecimal.valueOf(0.20))))));

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
  void saidaNaoPosteriorEntrada_lancaPeriodoInvalido() {
    var in = LocalDateTime.of(2026, 4, 14, 10, 0);
    assertThatThrownBy(() -> sut.calcularNumeroDiarias(in, in))
        .isInstanceOf(BusinessException.class)
        .hasFieldOrPropertyWithValue("code", "PERIODO_INVALIDO")
        .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST);
  }
}
