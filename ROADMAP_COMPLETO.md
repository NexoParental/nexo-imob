# 🚀 NEXO IMOB — Roadmap Completo + Orçamento

## ✅ IMPLEMENTANDO AGORA (GRATUITO)

### **Semana 1: Notificações por Email**
**Status:** 🔄 Em desenvolvimento
- Notificação quando demanda é respondida
- Alerta quando prazo vence (3 dias antes)
- Email de boas-vindas
- Usando: Resend (gratuito até 100 emails/dia, depois R$ 0,10/email)

### **Semana 1-2: Dashboard Executivo**
**Status:** 🔄 Em desenvolvimento
- Gráfico de demandas por status
- KPI: Tempo médio de resolução
- KPI: Taxa de conclusão
- Alertas do que precisa atenção
- Timeline visual de prazos
- Usando: PostgreSQL + Supabase (gratuito)

### **Semana 2: Calendário de Prazos**
**Status:** 🔄 Em desenvolvimento
- Visão mensal/semanal de datas
- Alertas: 7 dias, 3 dias, 1 dia antes
- Exportar para ICS (sincronizar com Google Calendar/Outlook)
- Usando: Supabase + bibliotecas JavaScript gratuitas

### **Semana 2-3: Gerador de Documentos (PDF)**
**Status:** 🔄 Em desenvolvimento
- Notificação extrajudicial (template preenchido)
- Carta de cobrança
- Aviso de despejo
- Distrato de contrato
- Documentos assinados (sem certificado, apenas imagem)
- Usando: PDFKit (gratuito)

### **Semana 3: Relatórios Avançados**
**Status:** 🔄 Em desenvolvimento
- Relatório mensal automático (por email)
- Export: PDF, Excel, CSV
- Filtros: período, tipo, status, responsável
- Gráficos customizáveis
- Usando: ExcelJS + PDFKit (gratuitos)

### **Semana 4: Integração CNJ (Acompanhamento de Processos)**
**Status:** 🔄 Em desenvolvimento
- Sincronização automática 2x ao dia
- Consulta de status do processo
- Timeline de andamentos
- Alertas quando muda
- Usando: API CNJ pública (gratuita)

### **Semana 4-5: Integração eRPJ (Matrícula de Imóvel)**
**Status:** 🔄 Em desenvolvimento
- Consulta de matrícula atualizada
- Alerta se há ônus/hipotecas
- Histórico de consultas
- Usando: API eRPJ pública (gratuita para 1.000 consultas/mês)

---

## 💳 PENDENTE — Funcionalidades Pagas (Opcionais)

### **1. SMS Notifications**
**Status:** 🔴 Pendente (Pago)

**Função:** Alertar sobre prazos urgentes por SMS

**Opções:**
- **Twilio** (USA-based)
  - Preço: R$ 0,15 por SMS
  - Mínimo: Nenhum
  - Cálculo: 100 SMSs/mês = R$ 15/mês
  
- **AWS SNS** (Amazon)
  - Preço: R$ 0,50 por SMS (Brasil)
  - Mínimo: Nenhum
  - Cálculo: 100 SMSs/mês = R$ 50/mês

- **Zenvia** (Brasil)
  - Preço: R$ 0,08-0,12 por SMS
  - Mínimo: Nenhum
  - Cálculo: 100 SMSs/mês = R$ 8-12/mês

**Recomendação:** Zenvia (mais barato, suporte em português)
**Custo estimado:** R$ 100-200/mês (para 1.000-2.000 SMSs)

---

### **2. Assinatura Digital ICP-Brasil**
**Status:** 🔴 Pendente (Pago)

**Função:** Assinar documentos legalmente (válido em juízo)

**Opções:**
- **Docusign** (Internacional)
  - Preço: $165/mês (~R$ 800)
  - Mínimo: Mensal
  - Benefício: Integração fácil, suporte 24/7

- **SafeSign** (Brasil)
  - Preço: R$ 300-500/mês
  - Mínimo: Mensal
  - Benefício: ICP-Brasil, suporte em português

- **Assinador Livre** (Open source)
  - Preço: GRATUITO (você hospeda)
  - Mínimo: Nenhum
  - Problema: Precisa certificado próprio (R$ 100-300/ano)

**Recomendação:** Começar com Assinador Livre + certificado próprio (mais barato)
**Custo estimado:** R$ 100-300/ano (certificado) + R$ 0 (software)

---

### **3. Análise Automática de Contratos (IA)**
**Status:** 🔴 Pendente (Pago)

**Função:** Checar consistência, gaps, compliance, risco

**Opções:**
- **OpenAI GPT-4** (via API)
  - Preço: $0.03 por 1K tokens de entrada
  - Cálculo: Contrato médio = 500 tokens = $0.015 por análise
  - Para 100 contratos/mês = ~$1.50/mês (MUITO barato)
  - Mínimo: Nenhum

- **Claude API** (Anthropic)
  - Preço: $0.003 por 1K tokens
  - Cálculo: 100 contratos/mês = ~$0.15/mês
  - Mínimo: Nenhum

- **Azure OpenAI** (Microsoft)
  - Preço: $0.002 por 1K tokens
  - Cálculo: 100 contratos/mês = ~$0.10/mês
  - Mínimo: Nenhum

**Recomendação:** Claude API (mais barato, melhor qualidade)
**Custo estimado:** R$ 1-5/mês (praticamente gratuito para começar)

---

### **4. Integração com Cartórios (APIs Privadas)**
**Status:** 🔴 Pendente (Pago)

**Função:** Consulta real-time de matrícula, cartório digital

**Opções:**
- **Cartório Digital (CNJ)**
  - Preço: Consulta unitária ~R$ 5-20
  - Para 100 consultas/mês = R$ 500-2.000/mês
  - Mínimo: Por consulta

- **eNotariado** (Serasa)
  - Preço: Pacote corporativo = R$ 1.000-5.000/mês
  - Mínimo: Mensal

- **Integração direta com cartórios**
  - Preço: Varia por cartório (R$ 200-1.000/mês)
  - Mínimo: Mensal (por cartório)

**Recomendação:** Começar com CNJ eRPJ (gratuito até 1.000/mês), depois expandir
**Custo estimado:** R$ 500-2.000/mês (se usar muito)

---

### **5. App Mobile Nativo (iOS + Android)**
**Status:** 🔴 Pendente (Pago - Desenvolvimento)

**Função:** App para advogados acessarem de qualquer lugar

**Opções:**
- **React Native** (desenvolvimento próprio)
  - Custo: R$ 30-50k (desenvolvimento de 2-3 meses)
  - Mínimo: Uma vez
  - Depois: R$ 0 (hospedado na sua infra)

- **Flutter** (desenvolvimento próprio)
  - Custo: R$ 20-40k (desenvolvimento de 2-3 meses)
  - Mínimo: Uma vez
  - Depois: R$ 0

- **PWA (Progressive Web App)** ✅ GRATUITO
  - Custo: R$ 0 (funciona no navegador do celular)
  - Vantagem: Não precisa de App Store
  - Mínimo: Nenhum

**Recomendação:** Começar com PWA (gratuito), depois fazer app nativo se necessário
**Custo estimado:** R$ 0 agora, R$ 30-50k depois

---

### **6. Armazenamento Extra (Storage)**
**Status:** 🟡 Monitor

**Função:** Guardar documentos, PDFs, imagens de contratos

**Atual:** Supabase Storage = 1GB gratuito
**Limite:** 1.000 arquivos/mês gratuitos

**Se ultrapassar:**
- **Supabase Storage extra**
  - Preço: $5 por 100GB/mês
  - Cálculo: Se usar 200GB = $10/mês
  - Mínimo: Mensal

- **AWS S3** (alternativa)
  - Preço: $0.023 por GB/mês
  - Cálculo: 200GB = ~$4.60/mês
  - Mínimo: Mensal

**Recomendação:** Usar Supabase por enquanto (incluso no plano)
**Custo estimado:** R$ 0 (nos primeiros 6 meses)

---

### **7. Hospedagem Melhorada (Vercel Pro)**
**Status:** 🟡 Monitor

**Função:** Melhorar performance, analytics, custom domain

**Atual:** Vercel gratuito (funciona bem)
**Se necessário upgrade:**
- **Vercel Pro**
  - Preço: $20/mês (~R$ 100)
  - Benefícios: Analytics, mais banda, suporte
  - Mínimo: Mensal

**Recomendação:** Ficar no gratuito por enquanto
**Custo estimado:** R$ 0 (escala depois se necessário)

---

### **8. Suporte de Parceiros (Integração via Webhooks)**
**Status:** 🟡 Monitor

**Função:** Cartórios/advogados conectam sistemas próprios

**Custo:** GRATUITO (API pública)

---

## 📊 Resumo de Custos (Cenário Realista)

### **Mínimo (Gratuito)**
```
- Notificações por email: R$ 0 (Resend, até 100/dia)
- Dashboard: R$ 0
- Calendário: R$ 0
- Documentos PDF: R$ 0
- Relatórios: R$ 0
- Integração CNJ: R$ 0
- Integração eRPJ: R$ 0

TOTAL/MÊS: R$ 0 ✅
```

### **Médio (Pequena Imobiliária)**
```
- Notificações email: R$ 0 (até 100/dia)
- SMS: R$ 150 (1.000 SMSs/mês)
- Assinatura digital: R$ 0 (certificado próprio: R$ 25/ano = R$ 2/mês)
- Análise IA: R$ 5 (100 contratos)
- Supabase Pro: R$ 0 (gratuito no início)

TOTAL/MÊS: R$ 157/mês
```

### **Completo (Grandes Imobiliárias)**
```
- Notificações email: R$ 200 (limite Resend)
- SMS: R$ 500 (5.000 SMSs/mês)
- Assinatura digital: R$ 300 (SafeSign)
- Análise IA: R$ 50 (1.000 contratos)
- Integração cartórios: R$ 1.500
- Supabase Pro: R$ 50
- Vercel Pro: R$ 100

TOTAL/MÊS: R$ 2.700/mês
```

---

## 🎯 Prioridade de Implementação

### **Fase 1 — Pronto em 4 semanas (GRATUITO)**
1. ✅ Notificações por email
2. ✅ Dashboard com KPIs
3. ✅ Calendário de prazos
4. ✅ Gerador de notificação extrajudicial
5. ✅ Relatórios (PDF, Excel)
6. ✅ Integração CNJ
7. ✅ Integração eRPJ

### **Fase 2 — Opcional (PAGO)**
8. 💳 SMS (Zenvia) — R$ 150/mês
9. 💳 Assinatura digital — R$ 25/mês
10. 💳 IA para análise — R$ 5/mês
11. 💳 Cartórios (por demanda) — R$ 0-2.000/mês

### **Fase 3 — Futuro (PAGO)**
12. 💳 App Mobile — R$ 30-50k (único)
13. 💳 Suporte 24/7 — R$ 0 (gratuito no MVP)

---

## ⚡ Comece AGORA (Checklist)

- [ ] Semana 1: Notificações por email
- [ ] Semana 1-2: Dashboard executivo
- [ ] Semana 2: Calendário de prazos
- [ ] Semana 2-3: Gerador de documentos (PDF)
- [ ] Semana 3: Relatórios (PDF, Excel)
- [ ] Semana 4: Integração CNJ
- [ ] Semana 4-5: Integração eRPJ

---

**Versão:** 2.0 — Plano Técnico Completo
**Data:** Julho 2026
**Orçamento total para launch:** R$ 0 (100% gratuito no MVP)
