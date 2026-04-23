package com.noairnobnb.config;

import com.noairnobnb.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
    return configuration.getAuthenticationManager();
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter)
      throws Exception {
    http.csrf(csrf -> csrf.disable());
    http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
    http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
    http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

    http.authorizeHttpRequests(
        auth ->
            auth.requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/h2-console/**")
                .permitAll()
                .requestMatchers("/api/auth/login", "/api/auth/register/**")
                .permitAll()
                .requestMatchers(HttpMethod.GET, "/api/quartos/**")
                .permitAll()
                .requestMatchers(HttpMethod.GET, "/api/media/**")
                .permitAll()
                .requestMatchers(HttpMethod.GET, "/api/residencias/*")
                .permitAll()
                .anyRequest()
                .authenticated());

    // Evita WWW-Authenticate: Basic (popup nativo do Chrome em 401) - API só com JSON.
    http.httpBasic(AbstractHttpConfigurer::disable);
    http.formLogin(AbstractHttpConfigurer::disable);
    http.exceptionHandling(
        ex ->
            ex.authenticationEntryPoint(
                    (request, response, authException) -> {
                      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                      response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                      response.getWriter().write("{\"code\":\"NAO_AUTENTICADO\",\"message\":\"Não autenticado\"}");
                    })
                .accessDeniedHandler(
                    (request, response, accessDeniedException) -> {
                      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                      response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                      response.getWriter().write("{\"code\":\"ACCESS_DENIED\",\"message\":\"Acesso negado\"}");
                    }));

    http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    var cfg = new CorsConfiguration();
    cfg.setAllowedOriginPatterns(List.of("*"));
    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    cfg.setAllowedHeaders(List.of("*"));
    cfg.setExposedHeaders(List.of("Authorization"));
    cfg.setAllowCredentials(true);

    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", cfg);
    return source;
  }
}
