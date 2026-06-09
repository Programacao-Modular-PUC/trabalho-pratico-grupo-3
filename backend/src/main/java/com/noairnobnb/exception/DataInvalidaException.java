package com.noairnobnb.exception;

import org.springframework.http.HttpStatus;

public class DataInvalidaException extends BusinessException {

  public DataInvalidaException(String message) {
    super(HttpStatus.BAD_REQUEST, "DATA_INVALIDA", message);
  }
}
