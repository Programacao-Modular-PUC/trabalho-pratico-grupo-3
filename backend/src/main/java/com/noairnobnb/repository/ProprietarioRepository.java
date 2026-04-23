package com.noairnobnb.repository;

import com.noairnobnb.model.entity.Proprietario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProprietarioRepository extends JpaRepository<Proprietario, Long> {
  Optional<Proprietario> findByUsuarioId(Long usuarioId);
  boolean existsByEmail(String email);
}

