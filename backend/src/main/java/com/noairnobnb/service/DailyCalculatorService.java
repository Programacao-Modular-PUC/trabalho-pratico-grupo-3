package com.noairnobnb.service;

import java.time.LocalDateTime;

public interface DailyCalculatorService {
  int calcularNumeroDiarias(LocalDateTime dataHoraEntrada, LocalDateTime dataHoraSaida);
}
