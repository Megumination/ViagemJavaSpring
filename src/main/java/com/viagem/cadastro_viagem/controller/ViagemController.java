package com.viagem.cadastro_viagem.controller;

import com.viagem.cadastro_viagem.business.ViagemService;
import com.viagem.cadastro_viagem.infrastructure.entitys.Viagem;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/viagem" )
public class ViagemController {

    private final ViagemService viagemService;

    public ViagemController(ViagemService viagemService) {
        this.viagemService = viagemService;
    }

    @PostMapping
    public ResponseEntity<Viagem> salvarViagem(@RequestBody Viagem viagem) {
        Viagem viagemCriada = viagemService.salvarViagem(viagem);
        URI endereco = URI.create("/viagem/" + viagemCriada.getId());
        return ResponseEntity.created(endereco).body(viagemCriada);
    }

    @GetMapping
    public ResponseEntity<List<Viagem>> listarViagens() {
        return ResponseEntity.ok(viagemService.listarViagens());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Viagem> buscarViagemPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(viagemService.buscarViagemPorId(id));
    }

    @GetMapping("/destino/{destino}")
    public ResponseEntity<Viagem> buscarViagemPorDestino(@PathVariable String destino) {
        return ResponseEntity.ok(viagemService.buscarViagemPorDestino(destino));
    }

    @GetMapping("/pesquisa")
    public ResponseEntity<List<Viagem>> pesquisarPorDestino(@RequestParam String destino) {
        return ResponseEntity.ok(viagemService.pesquisarPorDestino(destino));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Viagem> atualizarViagem(
            @PathVariable Integer id,
            @RequestBody Viagem viagem) {
        return ResponseEntity.ok(viagemService.atualizarViagemPorId(id, viagem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarViagem(@PathVariable Integer id) {
        viagemService.deletarViagemPorId(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/destino/{destino}")
    public ResponseEntity<Void> deletarViagemPorDestino(@PathVariable String destino) {
        viagemService.deletarViagemPorDestino(destino);
        return ResponseEntity.noContent().build();
    }
}