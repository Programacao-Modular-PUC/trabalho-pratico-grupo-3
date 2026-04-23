package com.noairnobnb.service;

import java.time.LocalDateTime;

public interface DisponibilidadeService {
  void assertPeriodoLivreParaReserva(
      Long quartoId, LocalDateTime inicio, LocalDateTime fim, Long ignorarReservaId);

  void assertPeriodoLivreParaAluguel(
      Long quartoId, LocalDateTime inicio, LocalDateTime fim, Long ignorarAluguelId);
}
