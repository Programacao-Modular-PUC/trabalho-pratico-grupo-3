package com.noairnobnb.service.impl;

import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.model.HospedagemCotacao;
import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.service.ValorDiariaService;
import com.noairnobnb.service.pricing.DiariaPricingStrategy;
import com.noairnobnb.service.pricing.DiariaValorContext;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ValorDiariaServiceImpl implements ValorDiariaService {
  private final List<DiariaPricingStrategy> strategies;

  public ValorDiariaServiceImpl(List<DiariaPricingStrategy> strategies) {
    this.strategies = strategies;
  }

  @Override
  public BigDecimal calcularValorDiaria(Quarto quarto) {
    return calcularValorDiaria(quarto, null);
  }

  @Override
  public BigDecimal calcularValorDiaria(Quarto quarto, HospedagemCotacao cotacao) {
    if (quarto == null) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "QUARTO_OBRIGATORIO", "Quarto é obrigatório");
    }
    var base = quarto.getValorBaseDiaria();
    if (base == null || base.compareTo(BigDecimal.ZERO) <= 0) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "VALOR_BASE_INVALIDO", "Valor base da diária inválido");
    }

    var ctx = new DiariaValorContext(quarto, base, cotacao);
    BigDecimal current = base;
    for (var s : strategies) {
      current = s.apply(ctx, current);
    }
    return current;
  }
}
