package com.noairnobnb.security;

import com.noairnobnb.repository.UsuarioRepository;
import java.util.stream.Collectors;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {
  private final UsuarioRepository usuarioRepository;

  public DatabaseUserDetailsService(UsuarioRepository usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    var usuario =
        usuarioRepository
            .findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

    var authorities =
        usuario.getRoles().stream()
            .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getName().name()))
            .collect(Collectors.toSet());

    return new AppUserPrincipal(
        usuario.getId(), usuario.getEmail(), usuario.getPasswordHash(), usuario.isAtivo(), authorities);
  }
}
