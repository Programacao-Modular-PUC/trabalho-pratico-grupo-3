package com.noairnobnb.model;

import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.model.enums.TipoQuarto;

/**
 * Parâmetros do aluguel ou reserva que afetam o cálculo da diária (hóspedes, berço
 * opcional no quarto casal, etc.).
 */
public record HospedagemCotacao(Integer numeroHospedes, boolean solicitaBerco) {

  /** Usado no catálogo e quando a API recebe cotação sem contexto. */
  public static HospedagemCotacao padraoParaQuarto(Quarto q) {
    if (q == null || q.getTipoQuarto() == null) {
      return new HospedagemCotacao(1, false);
    }
    return switch (q.getTipoQuarto()) {
      case INDIVIDUAL -> new HospedagemCotacao(null, false);
      case CASAL -> new HospedagemCotacao(2, false);
      case FAMILIA -> new HospedagemCotacao(1, false);
    };
  }

  public static boolean familiaRequerHospedes(TipoQuarto t) {
    return t == TipoQuarto.FAMILIA;
  }
}
