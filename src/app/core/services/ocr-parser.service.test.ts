import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { OCRParserService } from './ocr-parser.service.js';
import { VoiceCommandParserService } from './voice-command-parser.service.js';

describe('Block 6: OCRParserService & VoiceCommandParserService', () => {
  const ocrService = new OCRParserService();
  const voiceService = new VoiceCommandParserService();

  it('extracts total amount and currency from raw receipt text', () => {
    const rawReceipt = `
      SUPERMERCADO DIA %
      AV. CORDOBA 1234 - CABA
      CUIT: 30-68584930-1
      ---------------------------
      1x LECHE LA SERENISIMA    $1.250,00
      2x PAN LACTAL FAMILIAR    $3.400,00
      ---------------------------
      TOTAL ARS:               $4.650,00
      FECHA: 22/10/2026
    `;

    const parsed = ocrService.parseReceipt(rawReceipt);
    assert.equal(parsed.detectedAmount, 4650.00);
    assert.equal(parsed.detectedCurrency, 'ARS');
    assert.equal(parsed.detectedDate, '22/10/2026');
    assert.ok(parsed.confidenceScore > 0.7);
  });

  it('parses spoken natural language travel expense commands', () => {
    const spoken = 'Adicionar almoço no restaurante 15000 pesos';
    const parsed = voiceService.parse(spoken, 'ARS');

    assert.equal(parsed.amount, 15000);
    assert.equal(parsed.currency, 'ARS');
    assert.equal(parsed.category, 'food');
    assert.equal(parsed.isRecognized, true);
  });

  it('recognizes lodging and transport spoken expenses', () => {
    const spoken = 'Gasto de hotel 120 dólares';
    const parsed = voiceService.parse(spoken, 'USD');

    assert.equal(parsed.amount, 120);
    assert.equal(parsed.currency, 'USD');
    assert.equal(parsed.category, 'lodging');
  });
});
