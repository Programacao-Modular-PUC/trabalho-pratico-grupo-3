package com.noairnobnb.repository;

import com.noairnobnb.model.entity.Pagamento;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {
  Optional<Pagamento> findByAluguelId(Long aluguelId);

  @Query(
      """
      select distinct p from Pagamento p
        join fetch p.aluguel a
        join fetch a.cliente c
        join fetch c.usuario
        join fetch a.quarto q
        join fetch q.residencia r
        join fetch r.proprietario prop
      where p.id = :id
      """)
  Optional<Pagamento> findFetchedById(@Param("id") Long id);

  @Query(
      """
      select distinct p from Pagamento p
        join fetch p.aluguel a
        join fetch a.cliente c
        join fetch c.usuario
        join fetch a.quarto q
        join fetch q.residencia r
        join fetch r.proprietario prop
      where a.id = :aluguelId
      """)
  Optional<Pagamento> findFetchedByAluguelId(@Param("aluguelId") Long aluguelId);

  @Query(
      """
      select distinct p from Pagamento p
        join fetch p.aluguel a
        join fetch a.cliente c
        join fetch c.usuario
        join fetch a.quarto q
        join fetch q.residencia r
        join fetch r.proprietario prop
      """)
  Page<Pagamento> findAllFetched(Pageable pageable);

  @Query(
      """
      select distinct p from Pagamento p
        join fetch p.aluguel a
        join fetch a.cliente c
        join fetch c.usuario
        join fetch a.quarto q
        join fetch q.residencia r
        join fetch r.proprietario prop
      where prop.id = :proprietarioId
      """)
  Page<Pagamento> findAllFetchedByProprietarioId(@Param("proprietarioId") Long proprietarioId, Pageable pageable);

  @Query(
      """
      select distinct p from Pagamento p
        join fetch p.aluguel a
        join fetch a.cliente c
        join fetch c.usuario
        join fetch a.quarto q
        join fetch q.residencia r
        join fetch r.proprietario prop
      where c.id = :clienteId
      """)
  Page<Pagamento> findAllFetchedByClienteId(@Param("clienteId") Long clienteId, Pageable pageable);
}

