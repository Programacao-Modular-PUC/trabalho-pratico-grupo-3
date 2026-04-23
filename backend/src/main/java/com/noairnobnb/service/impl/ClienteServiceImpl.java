package com.noairnobnb.service.impl;

import com.noairnobnb.dto.request.ClienteUpdateRequest;
import com.noairnobnb.dto.response.ClienteResponse;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.mapper.ClienteMapper;
import com.noairnobnb.repository.AluguelRepository;
import com.noairnobnb.repository.ClienteRepository;
import com.noairnobnb.repository.ReservaRepository;
import com.noairnobnb.repository.UsuarioRepository;
import com.noairnobnb.service.ClienteService;
import com.noairnobnb.util.PageUtils;
import com.noairnobnb.util.SecurityUtils;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteServiceImpl implements ClienteService {
  private final ClienteRepository clienteRepository;
  private final UsuarioRepository usuarioRepository;
  private final ReservaRepository reservaRepository;
  private final AluguelRepository aluguelRepository;
  private final ClienteMapper clienteMapper;

  public ClienteServiceImpl(
      ClienteRepository clienteRepository,
      UsuarioRepository usuarioRepository,
      ReservaRepository reservaRepository,
      AluguelRepository aluguelRepository,
      ClienteMapper clienteMapper) {
    this.clienteRepository = clienteRepository;
    this.usuarioRepository = usuarioRepository;
    this.reservaRepository = reservaRepository;
    this.aluguelRepository = aluguelRepository;
    this.clienteMapper = clienteMapper;
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ClienteResponse> listar(Pageable pageable) {
    SecurityUtils.requireAny("ADMIN");
    return PageUtils.map(clienteRepository.findAll(pageable), clienteMapper::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public ClienteResponse buscarPorId(Long id) {
    if (SecurityUtils.hasAny("ADMIN")) {
      var c =
          clienteRepository
              .findById(id)
              .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
      return clienteMapper.toResponse(c);
    }
    if (SecurityUtils.hasAny("CLIENTE")) {
      var principal = SecurityUtils.requireUser();
      var me =
          clienteRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
      if (!me.getId().equals(id)) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
      return clienteMapper.toResponse(me);
    }
    throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
  }

  @Override
  @Transactional(readOnly = true)
  public ClienteResponse perfilClienteAutenticado() {
    SecurityUtils.requireAny("CLIENTE");
    var principal = SecurityUtils.requireUser();
    var cliente =
        clienteRepository
            .findByUsuarioId(principal.getUserId())
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
    return clienteMapper.toResponse(cliente);
  }

  @Override
  @Transactional
  public ClienteResponse atualizar(Long id, ClienteUpdateRequest request) {
    if (SecurityUtils.hasAny("ADMIN")) {
      var cliente =
          clienteRepository
              .findById(id)
              .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
      aplicarAtualizacao(cliente, request);
      clienteRepository.save(cliente);
      return clienteMapper.toResponse(cliente);
    }
    if (SecurityUtils.hasAny("CLIENTE")) {
      var principal = SecurityUtils.requireUser();
      var cliente =
          clienteRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
      if (!cliente.getId().equals(id)) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
      aplicarAtualizacao(cliente, request);
      clienteRepository.save(cliente);
      return clienteMapper.toResponse(cliente);
    }
    throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
  }

  @Override
  @Transactional
  public void excluir(Long id) {
    SecurityUtils.requireAny("ADMIN");
    var cliente =
        clienteRepository
            .findById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
    if (reservaRepository.existsByClienteId(id) || aluguelRepository.existsByClienteId(id)) {
      throw new BusinessException(HttpStatus.CONFLICT, "CLIENTE_EM_USO", "Cliente possui reservas/aluguéis vinculados");
    }
    var usuario = cliente.getUsuario();
    clienteRepository.delete(cliente);
    usuarioRepository.delete(usuario);
  }

  private void aplicarAtualizacao(com.noairnobnb.model.entity.Cliente cliente, ClienteUpdateRequest request) {
    var novoEmail = request.email().trim().toLowerCase();
    if (!novoEmail.equalsIgnoreCase(cliente.getUsuario().getEmail())
        && usuarioRepository.existsByEmail(novoEmail)) {
      throw new BusinessException(HttpStatus.CONFLICT, "EMAIL_DUPLICADO", "Email já cadastrado");
    }
    if (!novoEmail.equalsIgnoreCase(cliente.getEmail()) && clienteRepository.existsByEmail(novoEmail)) {
      throw new BusinessException(HttpStatus.CONFLICT, "EMAIL_DUPLICADO", "Email já cadastrado");
    }

    cliente.setNome(request.nome().trim());
    cliente.setEndereco(request.endereco().trim());
    cliente.setTelefone(request.telefone().trim());
    cliente.setEmail(novoEmail);

    cliente.getUsuario().setEmail(novoEmail);
  }
}
