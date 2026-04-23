package com.noairnobnb.security;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

public class AppUserPrincipal extends User {
  private final Long userId;

  public AppUserPrincipal(
      Long userId,
      String email,
      String password,
      boolean enabled,
      Collection<? extends GrantedAuthority> authorities) {
    super(email, password, enabled, true, true, true, authorities);
    this.userId = userId;
  }

  public Long getUserId() {
    return userId;
  }

  public Set<String> roleNames() {
    return getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .map(a -> a.replace("ROLE_", ""))
        .collect(Collectors.toSet());
  }
}
