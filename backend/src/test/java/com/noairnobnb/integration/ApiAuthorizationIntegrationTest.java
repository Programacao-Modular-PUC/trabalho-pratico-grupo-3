package com.noairnobnb.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.noairnobnb.security.AppUserPrincipal;
import com.noairnobnb.security.JwtService;
import java.util.Arrays;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiAuthorizationIntegrationTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private JwtService jwtService;

  private String bearer(long uid, String email, String... roles) {
    var auths =
        Arrays.stream(roles).map(r -> new SimpleGrantedAuthority("ROLE_" + r)).toList();
    var token = jwtService.generateToken(new AppUserPrincipal(uid, email, "N/A", true, auths));
    return "Bearer " + token;
  }

  @Test
  void loginCredenciaisInvalidas_retornaJsonSemBasicAuthHeader() throws Exception {
    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"naoexiste@test.com\",\"senha\":\"senhaerrada\"}"))
        .andExpect(status().isUnauthorized())
        .andExpect(header().doesNotExist("WWW-Authenticate"))
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
  }

  @Test
  void listarTodasResidencias_semToken_retorna401Json() throws Exception {
    mockMvc
        .perform(get("/api/residencias").param("page", "0").param("size", "10"))
        .andExpect(status().isUnauthorized())
        .andExpect(header().doesNotExist("WWW-Authenticate"));
  }

  @Test
  void listarTodasResidencias_comCliente_retorna403() throws Exception {
    mockMvc
        .perform(
            get("/api/residencias")
                .param("page", "0")
                .param("size", "10")
                .header("Authorization", bearer(50L, "cli@test.com", "CLIENTE")))
        .andExpect(status().isForbidden());
  }

  @Test
  void listarTodasResidencias_comAdmin_retorna200() throws Exception {
    mockMvc
        .perform(
            get("/api/residencias")
                .param("page", "0")
                .param("size", "10")
                .header("Authorization", bearer(1L, "admin@test.com", "ADMIN")))
        .andExpect(status().isOk());
  }

  @Test
  void criarAluguelCliente_comProprietario_retorna403() throws Exception {
    var body =
        """
        {"quartoId":1,"dataHoraEntrada":"2026-10-01T10:00:00","dataHoraSaida":"2026-10-02T10:00:00"}
        """;
    mockMvc
        .perform(
            post("/api/alugueis")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", bearer(2L, "prop@test.com", "PROPRIETARIO"))
                .content(body))
        .andExpect(status().isForbidden());
  }

  @Test
  void criarAluguelAdmin_semAdmin_retorna403() throws Exception {
    var body =
        """
        {"clienteId":1,"quartoId":1,"dataHoraEntrada":"2026-11-01T10:00:00","dataHoraSaida":"2026-11-02T10:00:00"}
        """;
    mockMvc
        .perform(
            post("/api/alugueis/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", bearer(3L, "cli2@test.com", "CLIENTE"))
                .content(body))
        .andExpect(status().isForbidden());
  }
}
