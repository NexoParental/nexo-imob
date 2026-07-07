# 📋 CHANGELOG — Nexo Imob

## [1.0.0] — Julho 2026

### ✅ Implementado Nesta Sessão

#### Funcionalidades Core
- **Dashboard Executivo**
  - KPIs: Total demandas, Contratos, Tempo médio, Taxa conclusão
  - Gráficos: Demandas por status
  - Alertas: Prazos próximos (7 dias)
  - API: `/api/dashboard/stats`

- **Notificações por Email**
  - Tipos: demanda_respondida, prazo_vencendo, novo_usuario, mensagem_lida
  - Config por usuário (email, SMS, push)
  - API: `/api/notificacoes/enviar`
  - Integração: Resend (gratuito até 100/dia)

- **Calendário de Prazos**
  - Integrado no Dashboard
  - Listagem automática de prazos próximos
  - Alertas visuais

- **Gerador de Documentos**
  - Tipos: Notificação extrajudicial, Carta cobrança, Aviso despejo, Distrato
  - API: `/api/documentos/gerar`
  - Download: .txt (pronto para PDF com PDFKit)
  - Storage: Supabase

- **Confirmação de Leitura (Read Receipts)**
  - 1 checkmark = enviada
  - 2 checkmarks = lida
  - Hover: "Lido por: [lista de quem leu]"
  - Privado: Cada um vê checkmarks só das suas mensagens

#### Integrações Externas
- **CNJ (Acompanhamento de Processos)**
  - API: `/api/integracao/cnj/sincronizar`
  - Sincronização 2x ao dia
  - Tabela: `processos_cnj`
  - Status: Implementada (falta wiring na UI)

- **eRPJ (Matrícula de Imóvel)**
  - API: `/api/integracao/erp/consultar-matricula`
  - Consulta: matrícula, proprietário, ônus/hipotecas
  - Tabela: `matriculas_consultadas`
  - Alerts: Ônus detectados automaticamente
  - Status: Implementada (falta wiring na UI)

#### Database
- **Migration 006**: `supabase/migrations/006_features_completas.sql`
  - Tabela: `notificacoes_enviadas`
  - Tabela: `notificacoes_config`
  - Tabela: `processos_cnj`
  - Tabela: `matriculas_consultadas`
  - Tabela: `documentos_gerados`
  - RLS completo

#### Componentes React Criados
- `app/(app)/dashboard/DashboardStats.tsx` — Componente de estatísticas
- `app/(app)/demandas/[id]/GerarDocumento.tsx` — Gerador de documentos
- `app/(app)/demandas/[id]/MarkAsReadEffect.tsx` — Marcador de leitura automático
- `app/(app)/demandas/[id]/MensagemItem.tsx` — Item de mensagem com checkmarks

#### APIs Criadas
- `app/api/dashboard/stats/route.ts`
- `app/api/notificacoes/enviar/route.ts`
- `app/api/documentos/gerar/route.ts`
- `app/api/integracao/cnj/sincronizar/route.ts`
- `app/api/integracao/erp/consultar-matricula/route.ts`

#### Documentação
- `PROPOSTA_NEXO_IMOB.md` — Proposta comercial completa
- `ROADMAP_COMPLETO.md` — Roadmap + orçamento detalhado
- `IMPLEMENTATION_STATUS.md` — Status de implementação
- `CHANGELOG.md` — Este arquivo

### 🚀 Deploy
- ✅ Deploy em Vercel: `nexo-imob.vercel.app`
- ✅ Build: `npm run build` — Sucesso
- Status: **PRONTO PARA USAR**

### ⏳ Próximos Passos

#### Imediato
1. **Rodar Migration 006 no Supabase**
   - Arquivo: `supabase/migrations/006_features_completas.sql`
   - Dashboard stats vão funcionar após isso

#### Semana 1
1. Adicionar UI para consulta CNJ na demanda
2. Adicionar UI para consulta eRPJ no imóvel
3. Implementar export para PDF/Excel (ExcelJS)
4. Testar notificações por email

#### Semana 2
1. SMS (Zenvia) — se necessário
2. Assinatura digital (SafeSign) — se necessário
3. IA para análise (Claude API) — se necessário
4. Relatórios automáticos

### 📊 Orçamento

| Serviço | Status | Custo |
|---|---|---|
| **MVP (Gratuito)** | ✅ | **R$ 0/mês** |
| Notificações email | ✅ | R$ 0 (até 100/dia) |
| Dashboard | ✅ | R$ 0 |
| CNJ/eRPJ | ✅ | R$ 0 |
| **Com SMS** | ⏳ | R$ 150-500/mês |
| **Com Assinatura Digital** | ⏳ | R$ 300/mês |
| **Com IA** | ⏳ | R$ 5/mês |

---

## 🔧 Checklist para Continuar

- [ ] Rodar migration 006 no Supabase
- [ ] Testar Dashboard stats
- [ ] Testar gerador de documentos
- [ ] Adicionar UI para CNJ
- [ ] Adicionar UI para eRPJ
- [ ] Implementar export PDF/Excel
- [ ] Testar notificações por email
- [ ] Testar com 2-3 usuários (imobiliária + jurídico)

---

**Última atualização:** 06 de julho de 2026
**Versão:** 1.0.0 MVP
**Status:** Pronto para piloto
