package com.noairnobnb.config;

import com.noairnobnb.model.entity.Cliente;
import com.noairnobnb.model.entity.Proprietario;
import com.noairnobnb.model.entity.Usuario;
import com.noairnobnb.model.enums.RoleName;
import com.noairnobnb.repository.ClienteRepository;
import com.noairnobnb.repository.ProprietarioRepository;
import com.noairnobnb.repository.RoleRepository;
import com.noairnobnb.repository.UsuarioRepository;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Seed: roles + 3 contas; sem dados de negócio; senhas com BCrypt. */
@Component
@Profile("!test")
@Order(2)
public class SeedDataRunner implements ApplicationRunner {
  private static final Logger log = LoggerFactory.getLogger(SeedDataRunner.class);

  private final RoleRepository roleRepository;
  private final UsuarioRepository usuarioRepository;
  private final PasswordEncoder passwordEncoder;
  private final ProprietarioRepository proprietarioRepository;
  private final ClienteRepository clienteRepository;

  public SeedDataRunner(
      RoleRepository roleRepository,
      UsuarioRepository usuarioRepository,
      PasswordEncoder passwordEncoder,
      ProprietarioRepository proprietarioRepository,
      ClienteRepository clienteRepository) {
    this.roleRepository = roleRepository;
    this.usuarioRepository = usuarioRepository;
    this.passwordEncoder = passwordEncoder;
    this.proprietarioRepository = proprietarioRepository;
    this.clienteRepository = clienteRepository;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    ensureRole(RoleName.ADMIN);
    ensureRole(RoleName.PROPRIETARIO);
    ensureRole(RoleName.CLIENTE);

    seedIfMissing(
        "admin@noairnobnb.com",
        "Admin@123",
        RoleName.ADMIN,
        null,
        null);

    seedIfMissing(
        "proprietario@noairnobnb.com",
        "Proprietario@123",
        RoleName.PROPRIETARIO,
        "Proprietário Seed",
        null);

    seedIfMissing(
        "cliente@noairnobnb.com",
        "Cliente@123",
        RoleName.CLIENTE,
        null,
        "00000000191");

    // Se a base H2 já tinha estes e-mails (ex.: seed antigo ou testes manuais), o hash pode não bater com o README.
    syncSeedPasswordIfOutOfDate("admin@noairnobnb.com", "Admin@123");
    syncSeedPasswordIfOutOfDate("proprietario@noairnobnb.com", "Proprietario@123");
    syncSeedPasswordIfOutOfDate("cliente@noairnobnb.com", "Cliente@123");

    log.info("=== Usuários de teste (seed) ===");
    log.info("ADMIN -> login: admin@noairnobnb.com | senha: Admin@123");
    log.info("PROPRIETARIO -> login: proprietario@noairnobnb.com | senha: Proprietario@123");
    log.info("CLIENTE -> login: cliente@noairnobnb.com | senha: Cliente@123");
    log.info("================================");
  }

  private void ensureRole(RoleName name) {
    roleRepository
        .findByName(name)
        .orElseGet(
            () -> {
              var r = new com.noairnobnb.model.entity.Role();
              r.setName(name);
              return roleRepository.save(r);
            });
  }

  /**
   * Garante que as três contas de demonstração aceitam sempre as senhas documentadas no README, mesmo que o
   * ficheiro H2 local já existisse com outro hash.
   */
  private void syncSeedPasswordIfOutOfDate(String email, String rawPassword) {
    usuarioRepository
        .findByEmail(email)
        .filter(u -> !passwordEncoder.matches(rawPassword, u.getPasswordHash()))
        .ifPresent(
            u -> {
              u.setPasswordHash(passwordEncoder.encode(rawPassword));
              usuarioRepository.save(u);
              log.warn("Hash da senha atualizado para a conta seed {} (alinhado ao README).", email);
            });
  }

  private void seedIfMissing(
      String email, String rawPassword, RoleName role, String proprietarioNome, String clienteCpf) {
    if (usuarioRepository.existsByEmail(email)) {
      return;
    }

    var roleEntity =
        roleRepository.findByName(role).orElseThrow(() -> new IllegalStateException("Role ausente: " + role));

    var usuario = new Usuario();
    usuario.setEmail(email);
    usuario.setPasswordHash(passwordEncoder.encode(rawPassword));
    usuario.setAtivo(true);
    usuario.setRoles(Set.of(roleEntity));
    usuarioRepository.save(usuario);

    if (role == RoleName.PROPRIETARIO) {
      var p = new Proprietario();
      p.setUsuario(usuario);
      p.setNome(proprietarioNome == null ? "Proprietário" : proprietarioNome);
      p.setTelefone("00000000000");
      p.setEmail(email);
      proprietarioRepository.save(p);
    }

    if (role == RoleName.CLIENTE) {
      var c = new Cliente();
      c.setUsuario(usuario);
      c.setNome("Cliente Seed");
      c.setCpf(clienteCpf == null ? "00000000191" : clienteCpf);
      c.setEndereco("Endereço seed");
      c.setTelefone("00000000000");
      c.setEmail(email);
      clienteRepository.save(c);
    }
  }
}
