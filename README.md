# 📊 Finanças Pessoais - Controle Financeiro

> **Status:** Versão 1.0 Completa ✅

### Um sistema web simples e eficaz para gerenciamento de finanças pessoais. Acompanhe suas receitas e despesas, visualize seu progresso com gráficos interativos e planeje seu futuro financeiro.

---

### ✨ Funcionalidades

Quase tudo o que planejamos foi implementado com sucesso!

- [x] **Dashboard Principal:** Resumo visual com saldo atual, total de receitas e despesas.
- [x] **Cadastro de Transações:** Formulário intuitivo para adicionar novas receitas e despesas.
- [x] **Listagem de Transações:** Histórico completo de transações com rolagem.
- [x] **Edição e Remoção:** Gerenciamento completo das transações cadastradas (Remoção implementada, Edição via modal a ser implementada).
- [x] **Gráfico Interativo:** Gráfico de pizza para análise de despesas por categoria.
- [x] **Planejamento Financeiro:** Definição e acompanhamento de metas de economia.
- [x] **Orçamento Mensal:** Definição de limites de gastos por categoria com acompanhamento visual.
- [x] **Filtros Avançados:** Filtragem de transações por período (data de início e fim).
- [x] **Design Responsivo e Moderno:** Experiência de uso otimizada para desktops e dispositivos móveis, com suporte a tema escuro (dark mode).
- [x] **Exportação de Dados:** Opção para exportar o histórico de transações para formato CSV.

---

### 🛠️ Tecnologias Utilizadas

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=py,flask,html,css,js,sqlite&theme=light" />
  </a>
</p>

#### **Backend:**
-   **Flask:** Micro-framework Python para a construção da API RESTful.

#### **Frontend:**
-   **HTML5:** Estruturação semântica do conteúdo.
-   **CSS3:** Estilização moderna e responsiva com Flexbox e Grid.
-   **JavaScript (Puro/Vanilla):** Interatividade, requisições à API (Fetch) e manipulação dinâmica do DOM.

#### **Banco de Dados:**
-   **SQLite:** Banco de dados relacional leve e baseado em arquivo.

#### **Visualização de Dados:**
-   **Chart.js:** Biblioteca JavaScript para a criação de gráficos interativos.

---

### 🚀 Como Começar (Guia de Instalação Atualizado)

**Esta é a principal seção que precisava de ajustes para refletir os passos exatos que seguimos.**

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/GabyValeria/FinancePersonal.git](https://github.com/GabyValeria/FinancePersonal.git)
    cd FinancePersonal
    ```

2.  **Crie e ative um ambiente virtual:**
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Instale as dependências:**
    (Certifique-se de que o arquivo `requirements.txt` contém a palavra `Flask`)
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure o ambiente Flask:**
    Este passo é crucial para que os comandos do Flask funcionem corretamente.
    ```bash
    # No Windows (Prompt de Comando)
    set FLASK_APP=run.py

    # No Windows (PowerShell)
    $env:FLASK_APP="run.py"

    # No macOS/Linux
    export FLASK_APP=run.py
    ```

5.  **Inicialize o banco de dados:**
    Este comando precisa ser executado apenas uma vez para criar o arquivo `financas.db` e as tabelas.
    ```bash
    flask init-db
    ```

6.  **Execute a aplicação:**
    ```bash
    flask run
    ```

7.  **Acesse no seu navegador:**
    Abra `http://122.0.0.1:5000`.

---

### 🤝 Como Contribuir

Contribuições são bem-vindas! Sinta-se à vontade para fazer um Fork do projeto, criar uma Branch com sua nova funcionalidade e abrir um Pull Request.

---

### 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---

<p align="center">
  Desenvolvido com ❤️ por Gaby Valéria.
</p>
