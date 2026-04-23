package com.noairnobnb.service.impl;

import com.noairnobnb.dto.request.ProprietarioUpdateRequest;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.dto.response.ProprietarioResponse;
import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.mapper.ProprietarioMapper;
import com.noairnobnb.repository.ProprietarioRepository;
import com.noairnobnb.repository.UsuarioRepository;
import com.noairnobnb.service.ProprietarioService;
import com.noairnobnb.util.PageUtils;
import com.noairnobnb.util.SecurityUtils;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProprietarioServiceImpl implements ProprietarioService {
  private final ProprietarioRepository proprietarioRepository;
  private final UsuarioRepository usuarioRepository;
  private final ProprietarioMapper proprietarioMapper;

  public ProprietarioServiceImpl(
      ProprietarioRepository proprietarioRepository,
      UsuarioRepository usuarioRepository,
      ProprietarioMapper proprietarioMapper) {
    this.proprietarioRepository = proprietarioRepository;
    this.usuarioRepository = usuarioRepository;
    this.proprietarioMapper = proprietarioMapper;
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ProprietarioResponse> listarTodos(Pageable pageable) {
    SecurityUtils.requireAny("ADMIN");
    return PageUtils.map(proprietarioRepository.findAll(pageable), proprietarioMapper::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public ProprietarioResponse perfilAutenticado() {
    SecurityUtils.requireAny("PROPRIETARIO");
    var principal = SecurityUtils.requireUser();
    var p =
        proprietarioRepository
            .findByUsuarioId(principal.getUserId())
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
    return proprietarioMapper.toResponse(p);
  }

  @Override
  @Transactional
  public ProprietarioResponse atualizarAutenticado(ProprietarioUpdateRequest request) {
    SecurityUtils.requireAny("PROPRIETARIO");
    var principal = SecurityUtils.requireUser();
    var p =
        proprietarioRepository
            .findByUsuarioId(principal.getUserId())
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));

    var novoEmail = request.email().trim().toLowerCase();
    if (!novoEmail.equalsIgnoreCase(p.getUsuario().getEmail()) && usuarioRepository.existsByEmail(novoEmail)) {
      throw new BusinessException(HttpStatus.CONFLICT, "EMAIL_DUPLICADO", "Email já cadastrado");
    }

    p.setNome(request.nome().trim());
    p.setTelefone(request.telefone().trim());
    p.setEmail(novoEmail);
    p.getUsuario().setEmail(novoEmail);
    proprietarioRepository.save(p);
    return proprietarioMapper.toResponse(p);
  }
}
