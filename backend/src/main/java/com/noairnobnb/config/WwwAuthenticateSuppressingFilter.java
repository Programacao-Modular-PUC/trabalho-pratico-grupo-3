package com.noairnobnb.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import java.io.IOException;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Impede que respostas incluam {@code WWW-Authenticate: Basic}, o que faz o Chrome abrir o diálogo nativo de
 * login em APIs consumidas via XHR/fetch.
 */
public class WwwAuthenticateSuppressingFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    var wrapped =
        new HttpServletResponseWrapper(response) {
          @Override
          public void setHeader(String name, String value) {
            if (isWwwAuthenticate(name)) {
              return;
            }
            super.setHeader(name, value);
          }

          @Override
          public void addHeader(String name, String value) {
            if (isWwwAuthenticate(name)) {
              return;
            }
            super.addHeader(name, value);
          }

          @Override
          public void setDateHeader(String name, long date) {
            if (isWwwAuthenticate(name)) {
              return;
            }
            super.setDateHeader(name, date);
          }

          @Override
          public void addDateHeader(String name, long date) {
            if (isWwwAuthenticate(name)) {
              return;
            }
            super.addDateHeader(name, date);
          }
        };
    filterChain.doFilter(request, wrapped);
  }

  private static boolean isWwwAuthenticate(String name) {
    return name != null && "WWW-Authenticate".equalsIgnoreCase(name);
  }
}
