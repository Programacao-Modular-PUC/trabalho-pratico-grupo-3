package com.noairnobnb.controller;

import com.noairnobnb.config.OpenApiConfig;
import com.noairnobnb.dto.request.PagamentoUpdateRequest;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.dto.response.PagamentoResponse;
import com.noairnobnb.service.PagamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pagamentos")
@Tag(name = "Pagamentos")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class PagamentoController {
  private final PagamentoService pagamentoService;

  public PagamentoController(PagamentoService pagamentoService) {
    this.pagamentoService = pagamentoService;
  }

  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO','CLIENTE')")
  @Operation(summary = "Listar pagamentos conforme perfil")
  public PageResponse<PagamentoResponse> listar(@PageableDefault(size = 20) Pageable pageable) {
    return pagamentoService.listar(pageable);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO','CLIENTE')")
  @Operation(summary = "Buscar pagamento por id")
  public PagamentoResponse buscar(@PathVariable Long id) {
    return pagamentoService.buscarPorId(id);
  }

  @GetMapping("/aluguel/{aluguelId}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO','CLIENTE')")
  @Operation(summary = "Buscar pagamento por aluguel")
  public PagamentoResponse buscarPorAluguel(@PathVariable Long aluguelId) {
    return pagamentoService.buscarPorAluguelId(aluguelId);
  }

  @PatchMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO','CLIENTE')")
  @Operation(summary = "Atualizar status e forma de pagamento")
  public PagamentoResponse atualizar(@PathVariable Long id, @Valid @RequestBody PagamentoUpdateRequest request) {
    return pagamentoService.atualizar(id, request);
  }
}
