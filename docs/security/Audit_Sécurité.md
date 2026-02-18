
  Constats Sécurité (priorisés)

  1. Exposition de secrets en clair (critique)
     C:\The-Uprising-Game\TheUprising-Game\.env contient des clés réelles (OpenAI, Perplexity, ElevenLabs). Ces clés doivent être révoquées/rotées immédiatement, puis déplacées dans un secret manager.
     Risque: compromission complète de comptes API et coûts importants.
  2. Contrôle d’accès admin insuffisant (critique)
     Les routes admin acceptent tout utilisateur authentifié sans vérification de rôle/admin, donc un utilisateur “standard” peut tout lire/modifier.
     Fichiers:
     src/app/api/admin/tenants/route.ts
     src/app/api/admin/events/route.ts
     src/app/api/admin/report/route.ts
     src/app/api/admin/overview/route.ts
     À corriger par: claims is_admin, table de rôles, ou policy Supabase dédiée + vérification côté serveur.
  3. Exfiltration de leads sans auth (critique)
     src/app/api/admin/leads/csv/route.ts ne vérifie aucune auth.
     Risque: fuite PII (emails, notes).
     À corriger immédiatement: exiger auth + role admin + tenant match.
  4. Rapports publics accessibles par UUID (élevé)
     src/app/api/report/[id]/route.ts
     src/app/api/report/[id]/pdf/route.ts
     N’importe qui connaissant un sessionId peut lire les rapports. UUID ≠ secret.
     À corriger: token signé, “session secret”, ou auth + ownership.
     src/app/api/chat/route.ts
     src/app/api/voice/speak/route.ts
     src/app/api/audit/fetch/route.ts
     src/app/api/session/start/route.ts
     src/app/api/session/[id]/message/route.ts
     Un bot peut déclencher LLM/TTS/Whisper à l’infini.
     À corriger: rate limiting IP + quota par tenant + CAPTCHA + clés d’API côté kiosque.
  5. SSRF possible via audit/crawler (élevé)
     À corriger: validation de schéma, blocklist IP privées, DNS resolve + recheck, redirections limitées.
  6. Isolation multi-tenant insuffisante (élevé)
     RLS permissive et “authenticated USING (true)” dans supabase/migrations/003_hardening.sql.
     Toute identité Supabase authentifiée peut lire/écrire tout.
     À corriger: RLS tenant-scoped via JWT claims, ou policy tenant_id = auth.jwt()....
  7. Validation d’entrée incomplète (moyen)
     src/app/api/chat/route.ts accepte mode/niche/language sans schéma strict.
     voiceTranscript bypass la validation dans src/app/api/session/[id]/message/route.ts.
     À corriger: Zod partout, max length, whitelist stricte.
  8. Logs potentiellement sensibles (moyen)
     src/app/api/voice/speak/route.ts log le body complet (texte utilisateur).
     À corriger: logs redacted.
  9. Nettoyage temp files non garanti (moyen)
     src/app/api/voice/transcribe/route.ts supprime le fichier uniquement en succès.
     À corriger: try/finally pour cleanup, taille max fichier.

  ———

  Points d’amélioration Systèmes

  1. Traitements longs synchrones
     /api/audit/fetch fait crawl + agents + LLM dans une requête. Risque timeout + latence.
     Suggestion: job queue + status polling, ou worker séparé.
  2. Cache de PDF / rapports
     src/app/api/report/[id]/pdf/route.ts regenère le PDF à chaque appel.
     Suggestion: cache stockage (Supabase Storage/S3) + invalidation.
  3. Observabilité
     Pas de métriques structurées sur latence LLM, TTS, erreurs.
     Suggestion: métriques + traces (OpenTelemetry) + logs structurés.
  4. Politique de rétention PII
     raw_input_json, leads, event_logs conservent des données sensibles.
     Suggestion: TTL + purge + minimisation (champs).
  5. Gestion de quotas
     Aucune limite par tenant pour LLM/TTS/Whisper.
     Suggestion: quotas journaliers, budgets, et backoff.

  ———

  Actions immédiates recommandées

  1. Révoquer/rotater les clés exposées dans .env et déplacer vers un secret manager.
  2. Protéger admin/leads/csv et ajouter rôle admin obligatoire partout.
  3. Mettre en place rate limiting + auth pour endpoints LLM/TTS/Whisper/audit.
  4. Verrouiller RLS Supabase par tenant.
  5. Bloquer SSRF dans crawlUrl.

  Si tu veux, je peux proposer un patch ciblé (auth admin + RLS + rate limiting + SSRF guard) et te donner un plan de migration.

  Prochaines étapes possibles

  1. Je prépare un patch “sécurité minimum viable” (admin auth + rate limiting + SSRF block).
  2. Je propose un schéma RBAC multi-tenant + policies Supabase.
  3. Je mets en place un pipeline de jobs async pour l’audit et la génération PDF.
