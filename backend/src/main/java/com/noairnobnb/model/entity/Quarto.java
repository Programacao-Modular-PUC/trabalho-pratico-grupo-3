package com.noairnobnb.model.entity;

import com.noairnobnb.model.enums.TipoCamaCasal;
import com.noairnobnb.model.enums.TipoQuarto;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quartos")
public class Quarto extends AuditableEntity {
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "residencia_id", nullable = false)
  private Residencia residencia;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private TipoQuarto tipoQuarto;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal valorBaseDiaria;

  /** INDIVIDUAL: quantidade de camas de solteiro (1 ou mais; capacidade = número de camas). */
  @Column(name = "num_camas_solteiro")
  private Integer numCamasSolteiro;

  /**
   * INDIVIDUAL: adicional de diária por cada cama além da primeira (a primeira cama usa
   * apenas o valor base).
   */
  @Column(name = "adicional_diaria_por_cama_extra", precision = 12, scale = 2)
  private BigDecimal adicionalDiariaPorCamaExtra;

  /** CASAL: tipo de cama (comum x Queen/King) para adicional de conforto. */
  @Enumerated(EnumType.STRING)
  @Column(name = "tipo_cama_casal", length = 20)
  private TipoCamaCasal tipoCamaCasal;

  @Column(name = "permite_berco")
  private Boolean permiteBerco;

  @Column(name = "taxa_diaria_berco", precision = 12, scale = 2)
  private BigDecimal taxaDiariaBerco;

  @Column(name = "adicional_conforto_cama_comum", precision = 12, scale = 2)
  private BigDecimal adicionalConfortoCamaComum;

  @Column(name = "adicional_conforto_queen_king", precision = 12, scale = 2)
  private BigDecimal adicionalConfortoQueenKing;

  @Column(name = "fam_camas_solteiro")
  private Integer famCamasSolteiro;

  @Column(name = "fam_cama_casal_comum")
  private Integer famCamaCasalComum;

  @Column(name = "fam_cama_casal_grande")
  private Integer famCamaCasalGrande;

  /** Ambientes distintos (ex.: estudo, home office) — incidem taxa na regra de família. */
  @Column(name = "fam_ambientes_distintos")
  private Integer famAmbientesDistintos;

  @Column(nullable = false)
  private boolean possuiArCondicionado;

  @Column(nullable = false)
  private boolean possuiHidromassagem;

  @Column(nullable = false)
  private boolean ativo = true;

  @OneToMany(mappedBy = "quarto", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("ordem ASC")
  private List<QuartoImagem> imagens = new ArrayList<>();

  public Residencia getResidencia() {
    return residencia;
  }

  public void setResidencia(Residencia residencia) {
    this.residencia = residencia;
  }

  public TipoQuarto getTipoQuarto() {
    return tipoQuarto;
  }

  public void setTipoQuarto(TipoQuarto tipoQuarto) {
    this.tipoQuarto = tipoQuarto;
  }

  public BigDecimal getValorBaseDiaria() {
    return valorBaseDiaria;
  }

  public void setValorBaseDiaria(BigDecimal valorBaseDiaria) {
    this.valorBaseDiaria = valorBaseDiaria;
  }

  public boolean isPossuiArCondicionado() {
    return possuiArCondicionado;
  }

  public void setPossuiArCondicionado(boolean possuiArCondicionado) {
    this.possuiArCondicionado = possuiArCondicionado;
  }

  public boolean isPossuiHidromassagem() {
    return possuiHidromassagem;
  }

  public void setPossuiHidromassagem(boolean possuiHidromassagem) {
    this.possuiHidromassagem = possuiHidromassagem;
  }

  public boolean isAtivo() {
    return ativo;
  }

  public void setAtivo(boolean ativo) {
    this.ativo = ativo;
  }

  public List<QuartoImagem> getImagens() {
    return imagens;
  }

  public void setImagens(List<QuartoImagem> imagens) {
    this.imagens = imagens;
  }

  public Integer getNumCamasSolteiro() {
    return numCamasSolteiro;
  }

  public void setNumCamasSolteiro(Integer numCamasSolteiro) {
    this.numCamasSolteiro = numCamasSolteiro;
  }

  public BigDecimal getAdicionalDiariaPorCamaExtra() {
    return adicionalDiariaPorCamaExtra;
  }

  public void setAdicionalDiariaPorCamaExtra(BigDecimal adicionalDiariaPorCamaExtra) {
    this.adicionalDiariaPorCamaExtra = adicionalDiariaPorCamaExtra;
  }

  public TipoCamaCasal getTipoCamaCasal() {
    return tipoCamaCasal;
  }

  public void setTipoCamaCasal(TipoCamaCasal tipoCamaCasal) {
    this.tipoCamaCasal = tipoCamaCasal;
  }

  public Boolean getPermiteBerco() {
    return permiteBerco;
  }

  public void setPermiteBerco(Boolean permiteBerco) {
    this.permiteBerco = permiteBerco;
  }

  public BigDecimal getTaxaDiariaBerco() {
    return taxaDiariaBerco;
  }

  public void setTaxaDiariaBerco(BigDecimal taxaDiariaBerco) {
    this.taxaDiariaBerco = taxaDiariaBerco;
  }

  public BigDecimal getAdicionalConfortoCamaComum() {
    return adicionalConfortoCamaComum;
  }

  public void setAdicionalConfortoCamaComum(BigDecimal adicionalConfortoCamaComum) {
    this.adicionalConfortoCamaComum = adicionalConfortoCamaComum;
  }

  public BigDecimal getAdicionalConfortoQueenKing() {
    return adicionalConfortoQueenKing;
  }

  public void setAdicionalConfortoQueenKing(BigDecimal adicionalConfortoQueenKing) {
    this.adicionalConfortoQueenKing = adicionalConfortoQueenKing;
  }

  public Integer getFamCamasSolteiro() {
    return famCamasSolteiro;
  }

  public void setFamCamasSolteiro(Integer famCamasSolteiro) {
    this.famCamasSolteiro = famCamasSolteiro;
  }

  public Integer getFamCamaCasalComum() {
    return famCamaCasalComum;
  }

  public void setFamCamaCasalComum(Integer famCamaCasalComum) {
    this.famCamaCasalComum = famCamaCasalComum;
  }

  public Integer getFamCamaCasalGrande() {
    return famCamaCasalGrande;
  }

  public void setFamCamaCasalGrande(Integer famCamaCasalGrande) {
    this.famCamaCasalGrande = famCamaCasalGrande;
  }

  public Integer getFamAmbientesDistintos() {
    return famAmbientesDistintos;
  }

  public void setFamAmbientesDistintos(Integer famAmbientesDistintos) {
    this.famAmbientesDistintos = famAmbientesDistintos;
  }
}

