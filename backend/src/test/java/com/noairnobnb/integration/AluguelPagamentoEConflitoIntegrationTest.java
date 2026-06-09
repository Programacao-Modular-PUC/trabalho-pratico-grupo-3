package com.noairnobnb.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.noairnobnb.dto.request.AluguelCreateClienteRequest;
import com.noairnobnb.exception.QuartoIndisponivelException;
import com.noairnobnb.model.entity.Cliente;
import com.noairnobnb.model.entity.Proprietario;
import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.model.entity.Residencia;
import com.noairnobnb.model.entity.Role;
import com.noairnobnb.model.entity.Usuario;
import com.noairnobnb.model.enums.AluguelStatus;
import com.noairnobnb.model.enums.PagamentoStatus;
import com.noairnobnb.model.enums.RoleName;
import com.noairnobnb.model.enums.TipoQuarto;
import com.noairnobnb.repository.ClienteRepository;
import com.noairnobnb.repository.PagamentoRepository;
import com.noairnobnb.repository.ProprietarioRepository;
import com.noairnobnb.repository.QuartoRepository;
import com.noairnobnb.repository.ResidenciaRepository;
import com.noairnobnb.repository.RoleRepository;
import com.noairnobnb.repository.UsuarioRepository;
import com.noairnobnb.security.AppUserPrincipal;
import com.noairnobnb.service.AluguelService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AluguelPagamentoEConflitoIntegrationTest {

  @Autowired private RoleRepository roleRepository;
  @Autowired private UsuarioRepository usuarioRepository;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private ProprietarioRepository proprietarioRepository;
  @Autowired private ClienteRepository clienteRepository;
  @Autowired private ResidenciaRepository residenciaRepository;
  @Autowired private QuartoRepository quartoRepository;
  @Autowired private PagamentoRepository pagamentoRepository;
  @Autowired private AluguelService aluguelService;

  private Long quartoId;
  private Long clienteUsuarioId;

  @BeforeEach
  void setUp() {
    var roleCliente = roleRepository.findByName(RoleName.CLIENTE).orElseGet(this::criarRoleCliente);
    var roleProp = roleRepository.findByName(RoleName.PROPRIETARIO).orElseGet(this::criarRoleProprietario);

    var uProp = novoUsuario("it-prop-aluguel@test.com", Set.of(roleProp));
    usuarioRepository.save(uProp);
    var prop = new Proprietario();
    prop.setUsuario(uProp);
    prop.setNome("IT Prop");
    prop.setTelefone("11999990001");
    prop.setEmail(uProp.getEmail());
    proprietarioRepository.save(prop);

    var res = new Residencia();
    res.setProprietario(prop);
    res.setEndereco("Rua Teste");
    res.setNumero("10");
    res.setBairro("Centro");
    res.setCep("30130000");
    res.setTelefone("11999990002");
    res.setEmail("res@test.com");
    residenciaRepository.save(res);

    var q = new Quarto();
    q.setResidencia(res);
    q.setTipoQuarto(TipoQuarto.INDIVIDUAL);
    q.setValorBaseDiaria(new BigDecimal("100.00"));
    q.setPossuiArCondicionado(false);
    q.setPossuiHidromassagem(false);
    q.setAtivo(true);
    quartoRepository.save(q);
    quartoId = q.getId();

    var uCli = novoUsuario("it-cli-aluguel@test.com", Set.of(roleCliente));
    usuarioRepository.save(uCli);
    clienteUsuarioId = uCli.getId();
    var cli = new Cliente();
    cli.setUsuario(uCli);
    cli.setNome("IT Cliente");
    cli.setCpf("52998224725");
    cli.setEndereco("Rua Cliente");
    cli.setTelefone("11999990003");
    cli.setEmail(uCli.getEmail());
    clienteRepository.save(cli);
  }

  private Role criarRoleCliente() {
    var r = new Role();
    r.setName(RoleName.CLIENTE);
    return roleRepository.save(r);
  }

  private Role criarRoleProprietario() {
    var r = new Role();
    r.setName(RoleName.PROPRIETARIO);
    return roleRepository.save(r);
  }

  private Usuario novoUsuario(String email, Set<Role> roles) {
    var u = new Usuario();
    u.setEmail(email);
    u.setPasswordHash(passwordEncoder.encode("Test@123"));
    u.setAtivo(true);
    u.setRoles(roles);
    return u;
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void criarAluguelGeraPagamentoPendenteComMesmoValor() {
    loginCliente(clienteUsuarioId, "it-cli-aluguel@test.com");
    var entrada = LocalDateTime.of(2026, 8, 1, 10, 0);
    var saida = LocalDateTime.of(2026, 8, 2, 10, 0);
    var resp =
        aluguelService.criarParaClienteLogado(
            new AluguelCreateClienteRequest(quartoId, entrada, saida, null, null));

    assertThat(resp.numeroDiarias()).isEqualTo(1);
    assertThat(resp.valorTotal()).isNotNull();

    var pagOpt = pagamentoRepository.findByAluguelId(resp.id());
    assertThat(pagOpt).isPresent();
    var p = pagOpt.get();
    assertThat(p.getStatus()).isEqualTo(PagamentoStatus.PENDENTE);
    assertThat(p.getValor()).isEqualByComparingTo(resp.valorTotal());
  }

  @Test
  void segundoAluguelMesmoPeriodoRetornaConflito() {
    loginCliente(clienteUsuarioId, "it-cli-aluguel@test.com");
    var entrada = LocalDateTime.of(2026, 9, 1, 10, 0);
    var saida = LocalDateTime.of(2026, 9, 3, 10, 0);
    aluguelService.criarParaClienteLogado(
        new AluguelCreateClienteRequest(quartoId, entrada, saida, null, null));

    assertThatThrownBy(
            () ->
                aluguelService.criarParaClienteLogado(
                    new AluguelCreateClienteRequest(quartoId, entrada, saida, null, null)))
        .isInstanceOf(QuartoIndisponivelException.class)
        .hasFieldOrPropertyWithValue("code", "QUARTO_INDISPONIVEL");
  }

  @Test
  void cancelarAluguelAtivoLiberaPagamentoPendente() {
    loginCliente(clienteUsuarioId, "it-cli-aluguel@test.com");
    var entrada = LocalDateTime.of(2026, 10, 1, 10, 0);
    var saida = LocalDateTime.of(2026, 10, 3, 10, 0);
    var resp =
        aluguelService.criarParaClienteLogado(
            new AluguelCreateClienteRequest(quartoId, entrada, saida, null, null));

    var cancelado = aluguelService.cancelar(resp.id());

    assertThat(cancelado.status()).isEqualTo(AluguelStatus.CANCELADO);
    var pag = pagamentoRepository.findByAluguelId(resp.id()).orElseThrow();
    assertThat(pag.getStatus()).isEqualTo(PagamentoStatus.CANCELADO);

    var resp2 =
        aluguelService.criarParaClienteLogado(
            new AluguelCreateClienteRequest(quartoId, entrada, saida, null, null));
    assertThat(resp2.id()).isNotEqualTo(resp.id());
  }

  private static void loginCliente(Long usuarioId, String email) {
    var authorities = List.of(new SimpleGrantedAuthority("ROLE_CLIENTE"));
    var principal = new AppUserPrincipal(usuarioId, email, "N/A", true, authorities);
    var auth = new UsernamePasswordAuthenticationToken(principal, null, authorities);
    SecurityContextHolder.getContext().setAuthentication(auth);
  }
}
