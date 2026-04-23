package com.noairnobnb.service.impl;

import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.model.HospedagemCotacao;
import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.service.HospedagemValorService;
import com.noairnobnb.service.ValorDiariaService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class HospedagemValorServiceImpl implements HospedagemValorService {
  private final ValorDiariaService valorDiariaService;

  public HospedagemValorServiceImpl(ValorDiariaService valorDiariaService) {
    this.valorDiariaService = valorDiariaService;
  }

  @Override
  public BigDecimal calcularValorTotal(Quarto quarto, int numeroDiarias, HospedagemCotacao cotacao) {
    if (numeroDiarias <= 0) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "DIARIAS_INVALIDAS", "Número de diárias inválido");
    }
    var valorDiaria = valorDiariaService.calcularValorDiaria(quarto, cotacao);
    return valorDiaria.multiply(BigDecimal.valueOf(numeroDiarias)).setScale(2, RoundingMode.HALF_UP);
  }
}
