package com.noairnobnb.service.pricing;

import java.math.BigDecimal;

public interface DiariaPricingStrategy {
  BigDecimal apply(DiariaValorContext context, BigDecimal currentValorDiaria);
}
