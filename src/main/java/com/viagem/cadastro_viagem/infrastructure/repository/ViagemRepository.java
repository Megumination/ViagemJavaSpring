package com.viagem.cadastro_viagem.infrastructure.repository;

import com.viagem.cadastro_viagem.infrastructure.entitys.Viagem;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// JpaRepository já fornece os métodos básicos do CRUD.
public interface ViagemRepository extends JpaRepository<Viagem, Integer> {

    Optional<Viagem> findByDestino(String destino);

    List<Viagem> findAllByDestinoContainingIgnoreCase(String destino);

    @Transactional
    void deleteByDestino(String destino);
}
