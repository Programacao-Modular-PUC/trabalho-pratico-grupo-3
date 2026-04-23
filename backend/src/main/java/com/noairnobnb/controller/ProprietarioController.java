package com.noairnobnb.controller;

import com.noairnobnb.config.OpenApiConfig;
import com.noairnobnb.dto.request.ProprietarioUpdateRequest;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.dto.response.ProprietarioResponse;
import com.noairnobnb.service.ProprietarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/proprietarios")
@Tag(name = "Proprietários")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ProprietarioController {
  private final ProprietarioService proprietarioService;

  public ProprietarioController(ProprietarioService proprietarioService) {
    this.proprietarioService = proprietarioService;
  }

  @GetMapping("/perfil")
  @PreAuthorize("hasRole('PROPRIETARIO')")
  @Operation(summary = "Dados do proprietário autenticado")
  public ProprietarioResponse perfil() {
    return proprietarioService.perfilAutenticado();
  }

  @PutMapping("/perfil")
  @PreAuthorize("hasRole('PROPRIETARIO')")
  @Operation(summary = "Atualizar proprietário autenticado")
  public ProprietarioResponse atualizar(@Valid @RequestBody ProprietarioUpdateRequest request) {
    return proprietarioService.atualizarAutenticado(request);
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Listar proprietários (ADMIN)")
  public PageResponse<ProprietarioResponse> listar(@PageableDefault(size = 50) Pageable pageable) {
    return proprietarioService.listarTodos(pageable);
  }
}
