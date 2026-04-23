package com.noairnobnb.service;

import com.noairnobnb.model.HospedagemCotacao;
import com.noairnobnb.model.entity.Quarto;
import java.math.BigDecimal;

public interface ValorDiariaService {
  /** Usa a cotação padrão (catálogo / exibição). */
  BigDecimal calcularValorDiaria(Quarto quarto);

  /** Inclui hóspedes e opções (berço) conforme a regra do tipo de quarto. */
  BigDecimal calcularValorDiaria(Quarto quarto, HospedagemCotacao cotacao);
}
