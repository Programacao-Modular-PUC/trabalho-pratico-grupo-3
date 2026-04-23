package com.noairnobnb.service;

import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.model.HospedagemCotacao;
import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.model.enums.TipoQuarto;
import com.noairnobnb.service.pricing.QuartoCapacidadeHospedes;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class HospedagemCotacaoFactory {

  public HospedagemCotacao criar(Quarto q, Integer numeroHospedes, Boolean solicitaBerco) {
    if (q.getTipoQuarto() == TipoQuarto.INDIVIDUAL) {
      return new HospedagemCotacao(null, false);
    }
    if (q.getTipoQuarto() == TipoQuarto.CASAL) {
      int h = (numeroHospedes != null && numeroHospedes > 0) ? numeroHospedes : 2;
      boolean b = solicitaBerco != null && solicitaBerco;
      if (b && !Boolean.TRUE.equals(q.getPermiteBerco())) {
        throw new BusinessException(HttpStatus.BAD_REQUEST, "BERCO_NAO_DISPONIVEL", "Este quarto não oferece berço");
      }
      return new HospedagemCotacao(h, b);
    }
    if (q.getTipoQuarto() == TipoQuarto.FAMILIA) {
      if (numeroHospedes == null) {
        throw new BusinessException(HttpStatus.BAD_REQUEST, "HOSPEDES_FAMILIA_OBRIGATORIO", "Informe o número de hóspedes (quarto família).");
      }
      int cap = QuartoCapacidadeHospedes.capacidadeFamilia(q);
      if (cap < 1) {
        throw new BusinessException(
            HttpStatus.BAD_REQUEST, "FAMILIA_CONFIG_INVALIDA", "Quarto família sem capacidade configurada. Ajuste o cadastro do quarto.");
      }
      if (numeroHospedes < 1 || numeroHospedes > cap) {
        throw new BusinessException(
            HttpStatus.BAD_REQUEST,
            "HOSPEDES_FAMILIA_FORA_FAIXA",
            "Número de hóspedes deve ser entre 1 e " + cap + " para este quarto.");
      }
      return new HospedagemCotacao(numeroHospedes, false);
    }
    return HospedagemCotacao.padraoParaQuarto(q);
  }

  public HospedagemCotacao paraAluguelExistente(Quarto q, Integer numeroHospedes, boolean solicitaBerco) {
    if (q.getTipoQuarto() == TipoQuarto.INDIVIDUAL) {
      return new HospedagemCotacao(null, false);
    }
    if (q.getTipoQuarto() == TipoQuarto.CASAL) {
      int h = (numeroHospedes != null && numeroHospedes > 0) ? numeroHospedes : 2;
      return new HospedagemCotacao(h, solicitaBerco);
    }
    if (q.getTipoQuarto() == TipoQuarto.FAMILIA) {
      int h = (numeroHospedes != null) ? numeroHospedes : 1;
      return new HospedagemCotacao(h, false);
    }
    return HospedagemCotacao.padraoParaQuarto(q);
  }
}
