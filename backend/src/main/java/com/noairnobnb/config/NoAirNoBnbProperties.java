package com.noairnobnb.config;

import java.math.BigDecimal;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "noairnobnb")
public record NoAirNoBnbProperties(Security security, Business business) {
  public record Security(Jwt jwt) {
    public record Jwt(String issuer, String secret, long expiresInMinutes) {}
  }

  public record Business(Diaria diaria, Pricing pricing) {
    public record Diaria(int checkinHour, int checkoutHour) {}

    public record Pricing(Extras extras, Familia familia) {
      public record Extras(BigDecimal arCondicionado, BigDecimal hidromassagem) {}

      /**
       * Parâmetros globais do quarto família: acréscimo por hóspede, taxa por ambiente
       * extra, desconto progressivo em grupo.
       */
      public record Familia(
          BigDecimal percentualAcrescimoSobreBasePorHospedeAcimaDoPrimeiro,
          BigDecimal taxaDiariaPorAmbiente,
          BigDecimal descontoProgressivoPorHospedeGrupo,
          BigDecimal descontoGrupoMaximo) {}
    }
  }
}
