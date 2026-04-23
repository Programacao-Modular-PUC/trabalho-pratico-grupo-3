package com.noairnobnb.repository;

import com.noairnobnb.model.entity.Residencia;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResidenciaRepository extends JpaRepository<Residencia, Long> {
  List<Residencia> findByProprietarioId(Long proprietarioId);

  @Query(
      """
      select distinct r from Residencia r
        join fetch r.proprietario p
      where r.id = :id
      """)
  Optional<Residencia> findFetchedById(@Param("id") Long id);

  @Query(
      """
      select distinct r from Residencia r
        join fetch r.proprietario p
      """)
  Page<Residencia> findAllFetched(Pageable pageable);

  @Query(
      """
      select distinct r from Residencia r
        join fetch r.proprietario p
      where p.id = :proprietarioId
      """)
  Page<Residencia> findAllFetchedByProprietarioId(@Param("proprietarioId") Long proprietarioId, Pageable pageable);
}

