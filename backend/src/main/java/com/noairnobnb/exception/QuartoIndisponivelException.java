package com.noairnobnb.exception;

import org.springframework.http.HttpStatus;

public class QuartoIndisponivelException extends BusinessException {

  public QuartoIndisponivelException(String message) {
    super(HttpStatus.CONFLICT, "QUARTO_INDISPONIVEL", message);
  }
}
