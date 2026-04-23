package com.noairnobnb.service.pricing;

import com.noairnobnb.model.HospedagemCotacao;
import com.noairnobnb.model.entity.Quarto;
import java.math.BigDecimal;

/**
 * @param valorBaseDiaria Valor do campo comum a todos os quartos (antigo
 *     valorBaseDiaria).
 * @param cotacao Pode ser null: estratégias de tipo tratam padrão por quarto; extras (AR
 *     / hidro) ignora hóspedes.
 */
public record DiariaValorContext(Quarto quarto, BigDecimal valorBaseDiaria, HospedagemCotacao cotacao) {
  public HospedagemCotacao cotacaoOuPadrao() {
    if (cotacao != null) {
      return cotacao;
    }
    return HospedagemCotacao.padraoParaQuarto(quarto);
  }
}
