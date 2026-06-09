package com.noairnobnb.exception;

import org.springframework.http.HttpStatus;

public class CapacidadeExcedidaException extends BusinessException {

  public CapacidadeExcedidaException(String message) {
    super(HttpStatus.BAD_REQUEST, "CAPACIDADE_EXCEDIDA", message);
  }
}
