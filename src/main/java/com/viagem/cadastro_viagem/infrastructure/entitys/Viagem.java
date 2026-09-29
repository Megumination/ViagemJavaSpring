package com.viagem.cadastro_viagem.infrastructure.entitys;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "viagem")
@Entity
public class Viagem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @Column(name = "destino", nullable = false)
    private String destino;

    @Column(name = "data_ida", nullable = false)
    private LocalDate dataIda;

    @Column(name = "data_volta", nullable = false)
    private LocalDate dataVolta;

    @Column(name = "preco", nullable = false)
    private Double preco;

    @Column(name = "observacoes")
    private String observacoes;
}
