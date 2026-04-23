package com.noairnobnb.repository;

import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.model.enums.AluguelStatus;
import com.noairnobnb.model.enums.ReservaStatus;
import com.noairnobnb.model.enums.TipoQuarto;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuartoRepository extends JpaRepository<Quarto, Long>, JpaSpecificationExecutor<Quarto> {
  List<Quarto> findByResidenciaId(Long residenciaId);

  Page<Quarto> findByTipoQuarto(TipoQuarto tipoQuarto, Pageable pageable);

  @Query(
      value =
          """
          select distinct q from Quarto q
            join fetch q.residencia r
            join fetch r.proprietario p
            left join fetch q.imagens i
          where q.id = :id
          """)
  Optional<Quarto> findFetchedById(@Param("id") Long id);

  @Query(
      value =
          """
          select distinct q from Quarto q
            join fetch q.residencia r
            join fetch r.proprietario p
          where (:residenciaId is null or r.id = :residenciaId)
            and (:tipo is null or q.tipoQuarto = :tipo)
            and (:ar is null or q.possuiArCondicionado = :ar)
            and (:hidro is null or q.possuiHidromassagem = :hidro)
            and (:proprietarioId is null or p.id = :proprietarioId)
            and (:somenteAtivos is null or q.ativo = true)
          """,
      countQuery =
          """
          select count(distinct q.id) from Quarto q
            join q.residencia r
            join r.proprietario p
          where (:residenciaId is null or r.id = :residenciaId)
            and (:tipo is null or q.tipoQuarto = :tipo)
            and (:ar is null or q.possuiArCondicionado = :ar)
            and (:hidro is null or q.possuiHidromassagem = :hidro)
            and (:proprietarioId is null or p.id = :proprietarioId)
            and (:somenteAtivos is null or q.ativo = true)
          """)
  Page<Quarto> findCatalogo(
      @Param("residenciaId") Long residenciaId,
      @Param("tipo") TipoQuarto tipo,
      @Param("ar") Boolean ar,
      @Param("hidro") Boolean hidro,
      @Param("proprietarioId") Long proprietarioId,
      @Param("somenteAtivos") Boolean somenteAtivos,
      Pageable pageable);

  @Query(
      value =
          """
          select distinct q from Quarto q
            join fetch q.residencia r
            join fetch r.proprietario p
          where (:residenciaId is null or r.id = :residenciaId)
            and (:tipo is null or q.tipoQuarto = :tipo)
            and (:ar is null or q.possuiArCondicionado = :ar)
            and (:hidro is null or q.possuiHidromassagem = :hidro)
            and (:proprietarioId is null or p.id = :proprietarioId)
            and (:somenteAtivos is null or q.ativo = true)
            and not exists (
              select 1 from Reserva res
              where res.quarto = q and res.status = :reservaStatus
                and res.dataHoraEntrada < :fim and res.dataHoraSaida > :inicio)
            and not exists (
              select 1 from Aluguel al
              where al.quarto = q and al.status in :aluguelStatus
                and al.dataHoraEntrada < :fim and al.dataHoraSaida > :inicio)
          """,
      countQuery =
          """
          select count(distinct q.id) from Quarto q
            join q.residencia r
            join r.proprietario p
          where (:residenciaId is null or r.id = :residenciaId)
            and (:tipo is null or q.tipoQuarto = :tipo)
            and (:ar is null or q.possuiArCondicionado = :ar)
            and (:hidro is null or q.possuiHidromassagem = :hidro)
            and (:proprietarioId is null or p.id = :proprietarioId)
            and (:somenteAtivos is null or q.ativo = true)
            and not exists (
              select 1 from Reserva res
              where res.quarto = q and res.status = :reservaStatus
                and res.dataHoraEntrada < :fim and res.dataHoraSaida > :inicio)
            and not exists (
              select 1 from Aluguel al
              where al.quarto = q and al.status in :aluguelStatus
                and al.dataHoraEntrada < :fim and al.dataHoraSaida > :inicio)
          """)
  Page<Quarto> findCatalogoDisponivelEntre(
      @Param("residenciaId") Long residenciaId,
      @Param("tipo") TipoQuarto tipo,
      @Param("ar") Boolean ar,
      @Param("hidro") Boolean hidro,
      @Param("proprietarioId") Long proprietarioId,
      @Param("somenteAtivos") Boolean somenteAtivos,
      @Param("inicio") LocalDateTime inicio,
      @Param("fim") LocalDateTime fim,
      @Param("reservaStatus") ReservaStatus reservaStatus,
      @Param("aluguelStatus") List<AluguelStatus> aluguelStatus,
      Pageable pageable);
}
