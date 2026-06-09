package com.noairnobnb.testutil;

import com.noairnobnb.config.NoAirNoBnbProperties;
import java.math.BigDecimal;

public final class TestPricingProperties {

  private TestPricingProperties() {}

  public static NoAirNoBnbProperties padrao() {
    return new NoAirNoBnbProperties(
        new NoAirNoBnbProperties.Security(new NoAirNoBnbProperties.Security.Jwt("x", "y", 60)),
        new NoAirNoBnbProperties.Business(
            new NoAirNoBnbProperties.Business.Diaria(12, 12),
            new NoAirNoBnbProperties.Business.Pricing(
                new NoAirNoBnbProperties.Business.Pricing.Extras(
                    new BigDecimal("0.20"), new BigDecimal("0.25")),
                new NoAirNoBnbProperties.Business.Pricing.Familia(
                    new BigDecimal("0.04"),
                    new BigDecimal("12.00"),
                    new BigDecimal("0.02"),
                    new BigDecimal("0.20")))));
  }
}
