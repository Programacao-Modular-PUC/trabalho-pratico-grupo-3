package com.noairnobnb.controller;

import com.noairnobnb.config.OpenApiConfig;
import com.noairnobnb.dto.request.ReservaCreateRequest;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.dto.response.ReservaResponse;
import com.noairnobnb.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservas")
@Tag(name = "Reservas")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ReservaController {
  private final ReservaService reservaService;

  public ReservaController(ReservaService reservaService) {
    this.reservaService = reservaService;
  }

  @PostMapping
  @PreAuthorize("hasRole('CLIENTE')")
  @Operation(summary = "Criar reserva futura (cliente autenticado)")
  public ResponseEntity<ReservaResponse> criar(@Valid @RequestBody ReservaCreateRequest request) {
    var body = reservaService.criarParaClienteLogado(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(body);
  }

  @PostMapping("/{id}/cancelar")
  @PreAuthorize("hasAnyRole('ADMIN','CLIENTE')")
  @Operation(summary = "Cancelar reserva")
  public ReservaResponse cancelar(@PathVariable Long id) {
    return reservaService.cancelar(id);
  }

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO','CLIENTE')")
  @Operation(summary = "Listar reservas conforme perfil")
  public PageResponse<ReservaResponse> listar(@PageableDefault(size = 20) Pageable pageable) {
    return reservaService.listar(pageable);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO','CLIENTE')")
  @Operation(summary = "Buscar reserva por id")
  public ReservaResponse buscar(@PathVariable Long id) {
    return reservaService.buscarPorId(id);
  }

  @GetMapping("/cliente/{clienteId}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO','CLIENTE')")
  @Operation(summary = "Listar reservas por cliente")
  public PageResponse<ReservaResponse> listarPorCliente(
      @PathVariable Long clienteId, @PageableDefault(size = 20) Pageable pageable) {
    return reservaService.listarPorCliente(clienteId, pageable);
  }

  @GetMapping("/quarto/{quartoId}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO','CLIENTE')")
  @Operation(summary = "Listar reservas por quarto")
  public PageResponse<ReservaResponse> listarPorQuarto(
      @PathVariable Long quartoId, @PageableDefault(size = 20) Pageable pageable) {
    return reservaService.listarPorQuarto(quartoId, pageable);
  }
}
