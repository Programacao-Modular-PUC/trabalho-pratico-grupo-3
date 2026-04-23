package com.noairnobnb.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.noairnobnb.model.entity.Role;
import com.noairnobnb.model.entity.Usuario;
import com.noairnobnb.model.enums.RoleName;
import com.noairnobnb.repository.RoleRepository;
import com.noairnobnb.repository.UsuarioRepository;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Simula o mesmo fluxo do frontend: {@code POST /api/auth/login} com e-mail/senha do README.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthLoginFlowIntegrationTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private RoleRepository roleRepository;
  @Autowired private UsuarioRepository usuarioRepository;
  @Autowired private PasswordEncoder passwordEncoder;

  @BeforeEach
  void seedAdminIgualAoReadme() {
    var roleAdmin =
        roleRepository
            .findByName(RoleName.ADMIN)
            .orElseGet(
                () -> {
                  var r = new Role();
                  r.setName(RoleName.ADMIN);
                  return roleRepository.save(r);
                });

    if (usuarioRepository.existsByEmail("admin@noairnobnb.com")) {
      return;
    }
    var u = new Usuario();
    u.setEmail("admin@noairnobnb.com");
    u.setPasswordHash(passwordEncoder.encode("Admin@123"));
    u.setAtivo(true);
    u.setRoles(Set.of(roleAdmin));
    usuarioRepository.save(u);
  }

  @Test
  void postLoginComCredenciaisReadme_retorna200TokenEUsuario() throws Exception {
    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"admin@noairnobnb.com\",\"senha\":\"Admin@123\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token").isString())
        .andExpect(jsonPath("$.token").isNotEmpty())
        .andExpect(jsonPath("$.usuario.email").value("admin@noairnobnb.com"))
        .andExpect(jsonPath("$.usuario.roles").isArray());
  }

  /** Domínio @noairbnb.local é aceito e mapeado para o e-mail seed real. */
  @Test
  void postLoginComDominioNoairbnbLocal_retorna200() throws Exception {
    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"admin@noairbnb.local\",\"senha\":\"Admin@123\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.usuario.email").value("admin@noairnobnb.com"));
  }
}
