# Comparador PRODES Série

Widget para **ArcGIS Experience Builder** que analisa a **série temporal** de desmatamento PRODES/Inpe por **recorte geográfico** (bioma, região, UF, etc.).

Desenvolvida com contribuição da equipe **CGCD/DPCD** — **MMA**.

Repositório: [github.com/perymonteiro/comparador_prodes_serie](https://github.com/perymonteiro/comparador_prodes_serie)

| | |
|---|---|
| **Versão** | 1.0.0 |
| **Experience Builder** | 1.18.0 |
| **Autor** | Thyego Pery |

## Funcionalidades

- Série **ano a ano** entre ano inicial e final (final posterior ao inicial)
- Configuração: **camada PRODES** + **coluna de recorte**
- Tabela com incremento absoluto (km²) e variação % em relação ao ano anterior
- Variação positiva em **vermelho**, negativa em **verde**
- **Copiar** tabela (TSV) e **exportar** `.xlsx` com gráfico de colunas nativo no Excel

## Modelo de dados

Feature Layer tabular PRODES:

| Formato | Estrutura |
|---------|-----------|
| Linha = ano | Coluna `ano` + colunas numéricas por recorte |
| Linha = recorte | Coluna do recorte + colunas com anos como atributos |

## Configuração e uso

**Autor:** selecione a camada PRODES e a coluna numérica do recorte. O campo ano é detectado automaticamente.

**Usuário:** escolha o intervalo de anos, consulte a tabela e, se quiser, copie ou exporte (`prodes-serie-{recorte}-{anoInicial}-{anoFinal}.xlsx`).

## Desenvolvimento e ArcGIS Enterprise

Coloque esta pasta em `client/your-extensions/widgets/comparador_prodes_serie/` do [Developer Edition](https://developers.arcgis.com/experience-builder/) **1.18.0** (versão alinhada ao Portal). Compile na raiz do client (`npm run build:prod` ou `npm run build:download`, conforme a versão do EXB).

No **ArcGIS Enterprise 11.0+**, registre o item **Experience Builder Widget** com a URL do `manifest.json` ([documentação Esri](https://doc.arcgis.com/en/experience-builder/11.0/configure-widgets/add-custom-widgets.htm)).

**Hospedagem (GitHub Pages):** build em `docs/` — Manifest URL:

`https://perymonteiro.github.io/comparador_prodes_serie/manifest.json`

Após alterar o código, recompile (`npm run build:prod` no client EXB) e atualize a pasta `docs/` antes do push.

## Licença e segurança

MIT — [LICENSE](LICENSE). [SECURITY.md](SECURITY.md).

## Widget relacionada

[Comparador PRODES](https://github.com/perymonteiro/comparador_prodes) — comparação entre dois **períodos**, não série ano a ano de um recorte.
