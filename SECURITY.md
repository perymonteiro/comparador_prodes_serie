# Política de segurança

## Versões suportadas

| Versão | Suportada |
|--------|-----------|
| 1.0.x  | Sim       |

## O que não deve ir para o repositório

- Tokens, senhas ou chaves de API (ArcGIS, GitHub, etc.)
- Arquivos `.env` com credenciais
- Dados sensíveis de camadas ou experiences de produção
- URLs internas ou endpoints restritos da organização

A widget **não armazena credenciais** no código: a autenticação é feita pelo Experience Builder / ArcGIS da sua organização.

## Reportar vulnerabilidade

Se encontrar um problema de segurança neste código:

1. **Não** abra uma issue pública com detalhes sensíveis.
2. Entre em contato com o mantenedor pelo canal institucional da MMA ou via GitHub (issues privadas, se disponível).

Descreva o impacto, passos para reproduzir e, se possível, uma sugestão de correção.

## Boas práticas ao usar a widget

- Publique experiences apenas em ambientes com controle de acesso adequado.
- Use camadas e serviços com permissões restritas ao público-alvo.
- Revise periodicamente quem pode editar a experience no Experience Builder.
