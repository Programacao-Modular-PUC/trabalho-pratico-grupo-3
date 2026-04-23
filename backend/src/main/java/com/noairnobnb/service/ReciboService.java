package com.noairnobnb.service;

import com.noairnobnb.dto.response.ReciboResponse;

public interface ReciboService {
  ReciboResponse gerarPorAluguelId(Long aluguelId);
}
