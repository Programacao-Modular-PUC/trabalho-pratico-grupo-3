package com.noairnobnb.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ApiErrorResponse> business(BusinessException ex, HttpServletRequest req) {
    return businessResponse(ex, req);
  }

  @ExceptionHandler({
    QuartoIndisponivelException.class,
    CapacidadeExcedidaException.class,
    DataInvalidaException.class,
    RecursoNaoPermitidoException.class
  })
  public ResponseEntity<ApiErrorResponse> domain(BusinessException ex, HttpServletRequest req) {
    return businessResponse(ex, req);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ApiErrorResponse> illegalArgument(IllegalArgumentException ex, HttpServletRequest req) {
    var body =
        new ApiErrorResponse(
            Instant.now(),
            HttpStatus.BAD_REQUEST.value(),
            "ARGUMENTO_INVALIDO",
            ex.getMessage() != null ? ex.getMessage() : "Argumento inválido",
            req.getRequestURI(),
            null);
    return ResponseEntity.badRequest().body(body);
  }

  @ExceptionHandler(java.time.DateTimeException.class)
  public ResponseEntity<ApiErrorResponse> dateTime(java.time.DateTimeException ex, HttpServletRequest req) {
    var body =
        new ApiErrorResponse(
            Instant.now(),
            HttpStatus.BAD_REQUEST.value(),
            "DATA_INVALIDA",
            "Data ou horário inválido",
            req.getRequestURI(),
            null);
    return ResponseEntity.badRequest().body(body);
  }

  private static ResponseEntity<ApiErrorResponse> businessResponse(BusinessException ex, HttpServletRequest req) {
    var body =
        new ApiErrorResponse(
            Instant.now(),
            ex.getStatus().value(),
            ex.getCode(),
            ex.getMessage(),
            req.getRequestURI(),
            null);
    return ResponseEntity.status(ex.getStatus()).body(body);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiErrorResponse> validation(MethodArgumentNotValidException ex, HttpServletRequest req) {
    var fieldErrors =
        ex.getBindingResult().getFieldErrors().stream()
            .map(
                fe ->
                    new ApiErrorResponse.FieldViolation(
                        fe.getField(),
                        fe.getDefaultMessage() == null ? "inválido" : fe.getDefaultMessage(),
                        fe.getRejectedValue()))
            .collect(Collectors.toList());

    var body =
        new ApiErrorResponse(
            Instant.now(),
            HttpStatus.BAD_REQUEST.value(),
            "VALIDATION_ERROR",
            "Dados inválidos",
            req.getRequestURI(),
            fieldErrors);
    return ResponseEntity.badRequest().body(body);
  }

  @ExceptionHandler({BadCredentialsException.class, AuthenticationException.class})
  public ResponseEntity<ApiErrorResponse> auth(AuthenticationException ex, HttpServletRequest req) {
    var body =
        new ApiErrorResponse(
            Instant.now(),
            HttpStatus.UNAUTHORIZED.value(),
            "UNAUTHORIZED",
            "Credenciais inválidas",
            req.getRequestURI(),
            null);
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ApiErrorResponse> accessDenied(AccessDeniedException ex, HttpServletRequest req) {
    var body =
        new ApiErrorResponse(
            Instant.now(),
            HttpStatus.FORBIDDEN.value(),
            "ACCESS_DENIED",
            "Acesso negado",
            req.getRequestURI(),
            null);
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
  }

  @ExceptionHandler(org.springframework.orm.ObjectOptimisticLockingFailureException.class)
  public ResponseEntity<ApiErrorResponse> optimisticLock(
      org.springframework.orm.ObjectOptimisticLockingFailureException ex, HttpServletRequest req) {
    var body =
        new ApiErrorResponse(
            Instant.now(),
            HttpStatus.CONFLICT.value(),
            "CONFLICT",
            "Conflito ao salvar dados",
            req.getRequestURI(),
            null);
    return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
  }

  @ExceptionHandler(NoResourceFoundException.class)
  public ResponseEntity<ApiErrorResponse> notFound(NoResourceFoundException ex, HttpServletRequest req) {
    var body =
        new ApiErrorResponse(
            Instant.now(),
            HttpStatus.NOT_FOUND.value(),
            "NOT_FOUND",
            "Recurso não encontrado",
            req.getRequestURI(),
            null);
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
  }

  @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
  public ResponseEntity<ApiErrorResponse> jpaEntityNotFound(
      jakarta.persistence.EntityNotFoundException ex, HttpServletRequest req) {
    var body =
        new ApiErrorResponse(
            Instant.now(),
            HttpStatus.NOT_FOUND.value(),
            "NOT_FOUND",
            "Recurso não encontrado",
            req.getRequestURI(),
            null);
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiErrorResponse> generic(Exception ex, HttpServletRequest req) {
    var body =
        new ApiErrorResponse(
            Instant.now(),
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "INTERNAL_ERROR",
            "Erro interno",
            req.getRequestURI(),
            null);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
  }
}
