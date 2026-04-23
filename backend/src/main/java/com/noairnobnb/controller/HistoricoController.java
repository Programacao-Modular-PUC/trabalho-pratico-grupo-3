package com.noairnobnb.controller;

import com.noairnobnb.config.OpenApiConfig;
import com.noairnobnb.dto.response.HistoricoLinhaResponse;
import com.noairnobnb.service.HistoricoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/historico")
@Tag(name = "Histórico")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class HistoricoController {
  private final HistoricoService historicoService;

  public HistoricoController(HistoricoService historicoService) {
    this.historicoService = historicoService;
  }

  @GetMapping("/cliente/{clienteId}")
  @PreAuthorize("hasAnyRole('ADMIN','CLIENTE')")
  @Operation(summary = "Histórico por cliente")
  public List<HistoricoLinhaResponse> porCliente(@PathVariable Long clienteId) {
    return historicoService.porCliente(clienteId);
  }

  @GetMapping("/quarto/{quartoId}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO')")
  @Operation(summary = "Histórico por quarto")
  public List<HistoricoLinhaResponse> porQuarto(@PathVariable Long quartoId) {
    return historicoService.porQuarto(quartoId);
  }

  @GetMapping("/residencia/{residenciaId}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO')")
  @Operation(summary = "Histórico por residência")
  public List<HistoricoLinhaResponse> porResidencia(@PathVariable Long residenciaId) {
    return historicoService.porResidencia(residenciaId);
  }

  @GetMapping("/recentes")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Linha do tempo recente (ADMIN)")
  public List<HistoricoLinhaResponse> recentes(@PageableDefault(size = 25) Pageable pageable) {
    return historicoService.recentes(pageable);
  }
}
