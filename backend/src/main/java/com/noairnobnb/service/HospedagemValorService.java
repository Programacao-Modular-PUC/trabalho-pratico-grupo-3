package com.noairnobnb.service;

import com.noairnobnb.model.HospedagemCotacao;
import com.noairnobnb.model.entity.Quarto;
import java.math.BigDecimal;

public interface HospedagemValorService {
  default BigDecimal calcularValorTotal(Quarto quarto, int numeroDiarias) {
    return calcularValorTotal(quarto, numeroDiarias, null);
  }

  BigDecimal calcularValorTotal(Quarto quarto, int numeroDiarias, HospedagemCotacao cotacao);
}
