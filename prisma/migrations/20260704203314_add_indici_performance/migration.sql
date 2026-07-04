-- CreateIndex
CREATE INDEX "Assicurazione_immobileId_idx" ON "Assicurazione"("immobileId");

-- CreateIndex
CREATE INDEX "ChecklistImmobile_contrattoId_idx" ON "ChecklistImmobile"("contrattoId");

-- CreateIndex
CREATE INDEX "ComunicazioneCondominiale_condominioId_idx" ON "ComunicazioneCondominiale"("condominioId");

-- CreateIndex
CREATE INDEX "Condominio_amministratoreId_idx" ON "Condominio"("amministratoreId");

-- CreateIndex
CREATE INDEX "Contratto_immobileId_idx" ON "Contratto"("immobileId");

-- CreateIndex
CREATE INDEX "Contratto_inquilinoId_idx" ON "Contratto"("inquilinoId");

-- CreateIndex
CREATE INDEX "Contratto_agenziaId_idx" ON "Contratto"("agenziaId");

-- CreateIndex
CREATE INDEX "Contratto_stato_idx" ON "Contratto"("stato");

-- CreateIndex
CREATE INDEX "Documento_contrattoId_idx" ON "Documento"("contrattoId");

-- CreateIndex
CREATE INDEX "Documento_immobileId_idx" ON "Documento"("immobileId");

-- CreateIndex
CREATE INDEX "Immobile_proprietarioId_idx" ON "Immobile"("proprietarioId");

-- CreateIndex
CREATE INDEX "Immobile_agenziaId_idx" ON "Immobile"("agenziaId");

-- CreateIndex
CREATE INDEX "Immobile_condominioId_idx" ON "Immobile"("condominioId");

-- CreateIndex
CREATE INDEX "InvitoInquilino_inquilinoId_idx" ON "InvitoInquilino"("inquilinoId");

-- CreateIndex
CREATE INDEX "InvitoInquilino_contrattoId_idx" ON "InvitoInquilino"("contrattoId");

-- CreateIndex
CREATE INDEX "LetturaComunicazione_userId_idx" ON "LetturaComunicazione"("userId");

-- CreateIndex
CREATE INDEX "Pagamento_contrattoId_idx" ON "Pagamento"("contrattoId");

-- CreateIndex
CREATE INDEX "Pagamento_stato_dataScadenza_idx" ON "Pagamento"("stato", "dataScadenza");

-- CreateIndex
CREATE INDEX "Partner_categoria_attivo_idx" ON "Partner"("categoria", "attivo");

-- CreateIndex
CREATE INDEX "RichiestaPreventivo_partnerId_idx" ON "RichiestaPreventivo"("partnerId");

-- CreateIndex
CREATE INDEX "RichiestaPreventivo_richiedenteUserId_idx" ON "RichiestaPreventivo"("richiedenteUserId");

-- CreateIndex
CREATE INDEX "RichiestaPreventivo_stato_idx" ON "RichiestaPreventivo"("stato");

-- CreateIndex
CREATE INDEX "Segnalazione_immobileId_idx" ON "Segnalazione"("immobileId");

-- CreateIndex
CREATE INDEX "Segnalazione_creatoDaUserId_idx" ON "Segnalazione"("creatoDaUserId");

-- CreateIndex
CREATE INDEX "Segnalazione_stato_idx" ON "Segnalazione"("stato");

-- CreateIndex
CREATE INDEX "SegnalazioneDestinatario_userId_idx" ON "SegnalazioneDestinatario"("userId");

-- CreateIndex
CREATE INDEX "SegnalazioneRisposta_segnalazioneId_idx" ON "SegnalazioneRisposta"("segnalazioneId");

-- CreateIndex
CREATE INDEX "Utenza_immobileId_idx" ON "Utenza"("immobileId");
