package com.noairnobnb.service.pricing;

import com.noairnobnb.config.NoAirNoBnbProperties;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class ExtrasDiariaPricingStrategy implements DiariaPricingStrategy {
  private final NoAirNoBnbProperties props;

  public ExtrasDiariaPricingStrategy(NoAirNoBnbProperties props) {
    this.props = props;
  }

  @Override
  public BigDecimal apply(DiariaValorContext context, BigDecimal currentValorDiaria) {
    var extras = props.business().pricing().extras();
    BigDecimal fator = BigDecimal.ONE;
    if (context.quarto().isPossuiArCondicionado()) {
      fator = fator.add(extras.arCondicionado());
    }
    if (context.quarto().isPossuiHidromassagem()) {
      fator = fator.add(extras.hidromassagem());
    }
    return currentValorDiaria.multiply(fator).setScale(2, RoundingMode.HALF_UP);
  }
}
