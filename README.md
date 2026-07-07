# Nexo Imob

Plataforma de comunicação entre imobiliária e escritório jurídico.
**Piloto:** Haroldo Lopes Imóveis × Nicola Advogados

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (tema Cinza Mineral)
- Supabase (PostgreSQL + Auth + Storage)
- Resend (e-mail transacional)
- Vercel (deploy)

## Setup
```bash
cp .env.local.example .env.local   # preencha com chaves Supabase + Resend
npm install
# Execute as migrations no Supabase SQL Editor (001 e 002)
npm run dev
```

Veja o arquivo nexo-imob-projeto-implantacao.md para o plano completo.
