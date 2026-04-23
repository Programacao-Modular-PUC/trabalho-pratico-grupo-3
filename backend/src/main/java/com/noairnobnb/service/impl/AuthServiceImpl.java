package com.noairnobnb.service.impl;

import com.noairnobnb.dto.request.AuthLoginRequest;
import com.noairnobnb.dto.request.ClienteRegisterRequest;
import com.noairnobnb.dto.response.AuthLoginResponse;
import com.noairnobnb.dto.response.UsuarioResponse;
import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.mapper.UsuarioMapper;
import com.noairnobnb.model.entity.Cliente;
import com.noairnobnb.model.entity.Usuario;
import com.noairnobnb.model.enums.RoleName;
import com.noairnobnb.repository.ClienteRepository;
import com.noairnobnb.repository.RoleRepository;
import com.noairnobnb.repository.UsuarioRepository;
import com.noairnobnb.security.AppUserPrincipal;
import com.noairnobnb.security.JwtService;
import com.noairnobnb.service.AuthService;
import com.noairnobnb.util.CpfUtils;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {
  private final org.springframework.security.authentication.AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final UsuarioRepository usuarioRepository;
  private final RoleRepository roleRepository;
  private final ClienteRepository clienteRepository;
  private final PasswordEncoder passwordEncoder;
  private final UsuarioMapper usuarioMapper;

  public AuthServiceImpl(
      org.springframework.security.authentication.AuthenticationManager authenticationManager,
      JwtService jwtService,
      UsuarioRepository usuarioRepository,
      RoleRepository roleRepository,
      ClienteRepository clienteRepository,
      PasswordEncoder passwordEncoder,
      UsuarioMapper usuarioMapper) {
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
    this.usuarioRepository = usuarioRepository;
    this.roleRepository = roleRepository;
    this.clienteRepository = clienteRepository;
    this.passwordEncoder = passwordEncoder;
    this.usuarioMapper = usuarioMapper;
  }

  /**
   * Aceita o domínio incorreto mas comum {@code @noairbnb.local}, alinhando ao seed real {@code @noairnobnb.com}.
   */
  static String normalizeLoginEmail(String emailLowercase) {
    if (emailLowercase.endsWith("@noairbnb.local")) {
      return emailLowercase.substring(0, emailLowercase.length() - "@noairbnb.local".length())
          + "@noairnobnb.com";
    }
    return emailLowercase;
  }

  @Override
  public AuthLoginResponse login(AuthLoginRequest request) {
    var email = normalizeLoginEmail(request.email().trim().toLowerCase());
    var token =
        new UsernamePasswordAuthenticationToken(email, request.senha().trim());
    var auth = authenticationManager.authenticate(token);

    var principal = (AppUserPrincipal) auth.getPrincipal();
    var jwt = jwtService.generateToken(principal);
    return new AuthLoginResponse(jwt, usuarioMapper.toResponse(usuarioRepository.findByEmail(principal.getUsername()).orElseThrow()));
  }

  @Override
  @Transactional
  public UsuarioResponse registerCliente(ClienteRegisterRequest request) {
    var email = request.email().trim().toLowerCase();
    if (usuarioRepository.existsByEmail(email)) {
      throw new BusinessException(HttpStatus.CONFLICT, "EMAIL_DUPLICADO", "Email já cadastrado");
    }

    var cpf = CpfUtils.apenasDigitos(request.cpf());
    if (cpf.length() != 11) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "CPF_INVALIDO", "CPF inválido");
    }
    if (clienteRepository.existsByCpf(cpf)) {
      throw new BusinessException(HttpStatus.CONFLICT, "CPF_DUPLICADO", "CPF já cadastrado");
    }
    if (clienteRepository.existsByEmail(email)) {
      throw new BusinessException(HttpStatus.CONFLICT, "EMAIL_DUPLICADO", "Email já cadastrado");
    }

    var roleCliente =
        roleRepository
            .findByName(RoleName.CLIENTE)
            .orElseThrow(() -> new IllegalStateException("Role CLIENTE não encontrada no banco"));

    var usuario = new Usuario();
    usuario.setEmail(email);
    usuario.setPasswordHash(passwordEncoder.encode(request.senha().trim()));
    usuario.setAtivo(true);
    usuario.setRoles(Set.of(roleCliente));
    usuarioRepository.save(usuario);

    var cliente = new Cliente();
    cliente.setUsuario(usuario);
    cliente.setNome(request.nome().trim());
    cliente.setCpf(cpf);
    cliente.setEndereco(request.endereco().trim());
    cliente.setTelefone(request.telefone().trim());
    cliente.setEmail(email);
    clienteRepository.save(cliente);

    return usuarioMapper.toResponse(usuario);
  }

  @Override
  @Transactional(readOnly = true)
  public UsuarioResponse me() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
      throw new BusinessException(HttpStatus.UNAUTHORIZED, "NAO_AUTENTICADO", "Não autenticado");
    }
    if (!(auth.getPrincipal() instanceof AppUserPrincipal principal)) {
      throw new BusinessException(HttpStatus.UNAUTHORIZED, "NAO_AUTENTICADO", "Não autenticado");
    }
    var usuario =
        usuarioRepository
            .findByEmail(principal.getUsername())
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "USUARIO_NAO_ENCONTRADO", "Usuário não encontrado"));
    return usuarioMapper.toResponse(usuario);
  }
}
