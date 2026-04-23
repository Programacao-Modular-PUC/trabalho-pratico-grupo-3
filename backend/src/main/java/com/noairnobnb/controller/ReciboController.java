package com.noairnobnb.controller;

import com.noairnobnb.config.OpenApiConfig;
import com.noairnobnb.dto.response.ReciboResponse;
import com.noairnobnb.service.ReciboService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recibos")
@Tag(name = "Recibos")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ReciboController {
  private final ReciboService reciboService;

  public ReciboController(ReciboService reciboService) {
    this.reciboService = reciboService;
  }

  @GetMapping("/aluguel/{aluguelId}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO','CLIENTE')")
  @Operation(summary = "Gerar / visualizar recibo por aluguel")
  public ReciboResponse porAluguel(@PathVariable Long aluguelId) {
    return reciboService.gerarPorAluguelId(aluguelId);
  }
}
