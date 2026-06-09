package com.noairnobnb.controller;

import com.noairnobnb.config.OpenApiConfig;
import com.noairnobnb.dto.request.AluguelCreateAdminRequest;
import com.noairnobnb.dto.request.AluguelCreateClienteRequest;
import com.noairnobnb.dto.request.AluguelFinalizarRequest;
import com.noairnobnb.dto.response.AluguelResponse;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.service.AluguelService;
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
@RequestMapping("/api/alugueis")
@Tag(name = "Aluguéis")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class AluguelController {
  private final AluguelService aluguelService;

  public AluguelController(AluguelService aluguelService) {
    this.aluguelService = aluguelService;
  }

  @PostMapping
  @PreAuthorize("hasRole('CLIENTE')")
  @Operation(summary = "Criar aluguel (cliente autenticado) + pagamento automático")
  public ResponseEntity<AluguelResponse> criarCliente(@Valid @RequestBody AluguelCreateClienteRequest request) {
    var body = aluguelService.criarParaClienteLogado(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(body);
  }

  @PostMapping("/admin")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Criar aluguel (ADMIN)")
  public ResponseEntity<AluguelResponse> criarAdmin(@Valid @RequestBody AluguelCreateAdminRequest request) {
    var body = aluguelService.criarAdmin(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(body);
  }

  @PostMapping("/{id}/finalizar")
  @PreAuthorize("hasAnyRole('ADMIN','CLIENTE','PROPRIETARIO')")
  @Operation(summary = "Finalizar aluguel (definir saída e recalcular)")
  public AluguelResponse finalizar(@PathVariable Long id, @Valid @RequestBody AluguelFinalizarRequest request) {
    return aluguelService.finalizar(id, request);
  }

  @PostMapping("/{id}/cancelar")
  @PreAuthorize("hasAnyRole('ADMIN','CLIENTE','PROPRIETARIO')")
  @Operation(summary = "Cancelar aluguel ativo")
  public AluguelResponse cancelar(@PathVariable Long id) {
    return aluguelService.cancelar(id);
  }

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO','CLIENTE')")
  @Operation(summary = "Listar aluguéis conforme perfil")
  public PageResponse<AluguelResponse> listar(@PageableDefault(size = 20) Pageable pageable) {
    return aluguelService.listar(pageable);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO','CLIENTE')")
  @Operation(summary = "Buscar aluguel por id")
  public AluguelResponse buscar(@PathVariable Long id) {
    return aluguelService.buscarPorId(id);
  }

  @GetMapping("/cliente/{clienteId}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO','CLIENTE')")
  @Operation(summary = "Listar aluguéis por cliente")
  public PageResponse<AluguelResponse> listarPorCliente(
      @PathVariable Long clienteId, @PageableDefault(size = 20) Pageable pageable) {
    return aluguelService.listarPorCliente(clienteId, pageable);
  }

  @GetMapping("/quarto/{quartoId}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO','CLIENTE')")
  @Operation(summary = "Listar aluguéis por quarto")
  public PageResponse<AluguelResponse> listarPorQuarto(
      @PathVariable Long quartoId, @PageableDefault(size = 20) Pageable pageable) {
    return aluguelService.listarPorQuarto(quartoId, pageable);
  }
}
