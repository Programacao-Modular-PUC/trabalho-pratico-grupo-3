package com.noairnobnb.repository;

import com.noairnobnb.model.entity.QuartoImagem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuartoImagemRepository extends JpaRepository<QuartoImagem, Long> {

  List<QuartoImagem> findByQuarto_IdOrderByOrdemAsc(Long quartoId);

  long countByQuarto_Id(Long quartoId);

  void deleteByQuarto_Id(Long quartoId);

  Optional<QuartoImagem> findByIdAndQuarto_Id(Long id, Long quartoId);
}
