-- =====================================================
-- NEXO IMOB — Seed: Haroldo Lopes × Nicola Advogados
-- =====================================================
-- Execute após criar os usuários no Supabase Auth Dashboard
-- Substitua os UUIDs pelos IDs reais gerados pelo Auth

-- Organizações
insert into organizations (id, name, type) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Haroldo Lopes Imóveis', 'imobiliaria'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Nicola Advogados',      'juridico');

-- Parceria
insert into parcerias (imobiliaria_id, juridico_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002');

-- Pessoas
insert into pessoas (id, organization_id, tipo_pessoa, papel_principal, nome, cpf, telefone, email) values
  ('cc000001-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'fisica', 'proprietario', 'Sérgio Melo',        '222.333.444-05', '(11) 98212-4471', 'sergio@exemplo.com'),
  ('cc000002-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'fisica', 'inquilino',    'Marcos Prado',       '109.887.665-22', '(11) 97744-2200', 'marcos@exemplo.com'),
  ('cc000003-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'fisica', 'fiador',       'Adriana Prado',      '044.556.211-90', '(11) 99101-8834', 'adriana@exemplo.com'),
  ('cc000004-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'fisica', 'inquilino',    'Beatriz Costa',      '301.220.443-11', '(11) 96633-0091', 'beatriz@exemplo.com'),
  ('cc000005-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'fisica', 'inquilino',    'Carla Nunes',        '255.109.887-40', '(11) 95522-7743', 'carla@exemplo.com'),
  ('cc000006-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'juridica','inquilino',   'Estúdio Ravena Ltda.','41.223.998/0001-05','(11) 98000-1122','contato@ravena.com'),
  ('cc000007-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'juridica','proprietario','Fundo Imob. Reserva Ltda.','33.444.555/0001-21','(11) 97700-0033','contato@reserva.com');

-- Imóveis
insert into imoveis (id, organization_id, logradouro, numero, bairro, cidade, uf, cep, tipo, matricula, cartorio, proprietario_id) values
  ('dd000001-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Rua das Acácias','120','Vila Mariana','São Paulo','SP','04030-000','apartamento','78.421','9º RI de São Paulo','cc000001-0000-0000-0000-000000000001'),
  ('dd000002-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Av. Higienópolis','88','Higienópolis','São Paulo','SP','01238-000','apartamento','55.902','9º RI de São Paulo','cc000007-0000-0000-0000-000000000001'),
  ('dd000003-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Av. Padre Pereira de Andrade','62','Perdizes','São Paulo','SP','05469-000','apartamento','61.117','9º RI de São Paulo','cc000001-0000-0000-0000-000000000001'),
  ('dd000004-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Rua Barão de Itapetininga','210','República','São Paulo','SP','01042-000','comercial','40.335','9º RI de São Paulo','cc000001-0000-0000-0000-000000000001');

-- Contratos (número gerado pelo trigger)
insert into contratos (id, organization_id, tipo, imovel_id, proprietario_id, inquilino_id, tipo_garantia, fiador_id, data_inicio, prazo_meses, valor, indice_reajuste, status) values
  ('ee000001-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','locacao_residencial','dd000001-0000-0000-0000-000000000001','cc000001-0000-0000-0000-000000000001','cc000002-0000-0000-0000-000000000001','fiador','cc000003-0000-0000-0000-000000000001','2023-03-01',30,2800,'IGP-M','inadimplente'),
  ('ee000002-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','locacao_residencial','dd000002-0000-0000-0000-000000000001','cc000007-0000-0000-0000-000000000001','cc000004-0000-0000-0000-000000000001','seguro_fianca',null,'2022-08-01',30,3200,'IPCA','inadimplente'),
  ('ee000003-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','locacao_residencial','dd000003-0000-0000-0000-000000000001','cc000001-0000-0000-0000-000000000001','cc000005-0000-0000-0000-000000000001','caucao',null,'2024-01-01',24,2200,'IGP-M','ativo'),
  ('ee000004-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','locacao_comercial','dd000004-0000-0000-0000-000000000001','cc000001-0000-0000-0000-000000000001','cc000006-0000-0000-0000-000000000001','titulo',null,'2021-05-01',48,4500,'IPCA','ativo');
