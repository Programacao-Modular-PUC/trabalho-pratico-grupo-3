package com.noairnobnb.exception;

import org.springframework.http.HttpStatus;

public class RecursoNaoPermitidoException extends BusinessException {

  public RecursoNaoPermitidoException(String message) {
    super(HttpStatus.BAD_REQUEST, "RECURSO_NAO_PERMITIDO", message);
  }
}
