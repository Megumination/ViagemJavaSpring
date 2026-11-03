package com.viagem.cadastro_viagem.controller;

import com.viagem.cadastro_viagem.business.ViagemService;
import com.viagem.cadastro_viagem.infrastructure.entitys.Viagem;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/viagem")
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

    // Pesquisar por destino
    @GetMapping("/pesquisa")
    public ResponseEntity<List<Viagem>> pesquisarPorDestino(@RequestParam String destino) {
        return ResponseEntity.ok(viagemService.pesquisarPorDestino(destino));
    }

    // Atualizar usando ID como parâmetro: /viagem?id=53
    @PutMapping
    public ResponseEntity<Viagem> atualizarViagemPorId(
            @RequestParam Integer id,
            @RequestBody Viagem viagem) {
        return ResponseEntity.ok(viagemService.atualizarViagemPorId(id, viagem));
    }

    // Atualizar usando destino: /viagem/pesquisa?destino=Salvador
    @PutMapping("/pesquisa")
    public ResponseEntity<Viagem> atualizarViagemPorDestino(
            @RequestParam String destino,
            @RequestBody Viagem viagem) {
        return ResponseEntity.ok(viagemService.atualizarViagemPorDestino(destino, viagem));
    }

    // Excluir usando ID como parâmetro: /viagem?id=53
    @DeleteMapping
    public ResponseEntity<Void> deletarViagemPorId(@RequestParam Integer id) {
        viagemService.deletarViagemPorId(id);
        return ResponseEntity.noContent().build();
    }

    // Excluir usando destino: /viagem/pesquisa?destino=Salvador
    @DeleteMapping("/pesquisa")
    public ResponseEntity<Void> deletarViagemPorDestino(@RequestParam String destino) {
        viagemService.deletarViagemPorDestino(destino);
        return ResponseEntity.noContent().build();
    }

    // Esta rota antiga também continua funcionando
    @DeleteMapping("/destino/{destino}")
    public ResponseEntity<Void> deletarViagemPeloCaminho(@PathVariable String destino) {
        viagemService.deletarViagemPorDestino(destino);
        return ResponseEntity.noContent().build();
    }
}
