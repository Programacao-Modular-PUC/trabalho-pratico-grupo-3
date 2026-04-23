package com.noairnobnb.controller;

import com.noairnobnb.config.OpenApiConfig;
import com.noairnobnb.dto.request.ClienteUpdateRequest;
import com.noairnobnb.dto.response.ClienteResponse;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.service.ClienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clientes")
@Tag(name = "Clientes")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ClienteController {
  private final ClienteService clienteService;

  public ClienteController(ClienteService clienteService) {
    this.clienteService = clienteService;
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Listar clientes (ADMIN)")
  public PageResponse<ClienteResponse> listar(@PageableDefault(size = 20) Pageable pageable) {
    return clienteService.listar(pageable);
  }

  @GetMapping("/perfil")
  @PreAuthorize("hasRole('CLIENTE')")
  @Operation(summary = "Perfil do cliente autenticado")
  public ClienteResponse perfil() {
    return clienteService.perfilClienteAutenticado();
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','CLIENTE')")
  @Operation(summary = "Buscar cliente por id")
  public ClienteResponse buscar(@PathVariable Long id) {
    return clienteService.buscarPorId(id);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','CLIENTE')")
  @Operation(summary = "Atualizar cliente")
  public ClienteResponse atualizar(@PathVariable Long id, @Valid @RequestBody ClienteUpdateRequest request) {
    return clienteService.atualizar(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Excluir cliente (ADMIN)")
  public ResponseEntity<Void> excluir(@PathVariable Long id) {
    clienteService.excluir(id);
    return ResponseEntity.noContent().build();
  }
}
