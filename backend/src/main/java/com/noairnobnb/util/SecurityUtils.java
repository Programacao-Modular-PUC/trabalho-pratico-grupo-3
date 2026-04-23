package com.noairnobnb.util;

import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.security.AppUserPrincipal;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {
  private SecurityUtils() {}

  public static AppUserPrincipal requireUser() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof AppUserPrincipal p)) {
      throw new BusinessException(HttpStatus.UNAUTHORIZED, "NAO_AUTENTICADO", "Não autenticado");
    }
    return p;
  }

  public static Authentication requireAuth() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
      throw new BusinessException(HttpStatus.UNAUTHORIZED, "NAO_AUTENTICADO", "Não autenticado");
    }
    return auth;
  }

  public static Set<String> roles() {
    return requireAuth().getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .map(a -> a.replace("ROLE_", ""))
        .collect(Collectors.toSet());
  }

  public static boolean hasAny(String... roles) {
    var r = roles();
    return Arrays.stream(roles).anyMatch(r::contains);
  }

  public static void requireAny(String... roles) {
    if (!hasAny(roles)) {
      throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
    }
  }

  /** Há usuário autenticado (não anônimo). */
  public static boolean isAuthenticated() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
      return false;
    }
    return !(auth.getPrincipal() instanceof String s && "anonymousUser".equals(s));
  }
}
