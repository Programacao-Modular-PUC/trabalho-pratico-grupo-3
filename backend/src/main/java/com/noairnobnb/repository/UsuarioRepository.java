package com.noairnobnb.repository;

import com.noairnobnb.model.entity.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
  Optional<Usuario> findByEmail(String email);
  boolean existsByEmail(String email);
}

