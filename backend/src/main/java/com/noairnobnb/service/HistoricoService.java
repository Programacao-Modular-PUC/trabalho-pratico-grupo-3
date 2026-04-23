package com.noairnobnb.service;

import com.noairnobnb.dto.response.HistoricoLinhaResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface HistoricoService {
  List<HistoricoLinhaResponse> porCliente(Long clienteId);

  List<HistoricoLinhaResponse> porQuarto(Long quartoId);

  List<HistoricoLinhaResponse> porResidencia(Long residenciaId);

  List<HistoricoLinhaResponse> recentes(Pageable pageable);
}
