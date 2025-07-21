# Sistema Financeiro Pessoal

Aplicação web full stack desenvolvida para controle financeiro pessoal, com foco em segurança, experiência do usuário e visualização de dados.

## 🛠️ Tecnologias Utilizadas

- **Front-end:** HTML, CSS, JavaScript (puro)
- **Back-end:** Python (Flask)
- **Banco de Dados:** MySQL

## 🚀 Funcionalidades Principais

- **Autenticação de Usuário**
  - Telas de login, registro e modal para recuperação de senha (*esqueci minha senha* em desenvolvimento)
  - Senhas protegidas com hash seguro
  - Acesso restrito a usuários autenticados em todas as páginas
  - Redirecionamento automático para o login caso o usuário não esteja autenticado

- **Dashboard e Navegação**
  - Após login, o usuário é direcionado à dashboard (*index.html*), com nome exibido no canto superior direito em um dropdown
  - Dropdown com opções de *Alterar Senha* e *Logout*
  - Navbar com navegação para *Home*, *Data* e menu suspenso com *Adicionar Despesa*, *Adicionar Receita* e *Gráfico de Dados*

- **Gestão de Receitas e Despesas**
  - Telas específicas para adicionar despesas (categorias como *gasto*, *presente*, etc) e receitas (categorias como *salário*, *pix*, *renda passiva*, etc)
  - Cada lançamento inclui categoria, valor, data e observação
  - Botão de envio desabilitado durante o processamento, com mensagem de sucesso exibida por 1,5s

- **Consulta e Edição de Dados**
  - Página *data.html* exibe registros paginados (10 por página), ordenados por data
  - UI aprimorada: hover escurece linha, botão X para deletar registro, engrenagem para editar e atualizar informações sem perder o layout

- **Visualização Gráfica**
  - Página *datachart.html* exibe gráfico mensal de receitas x despesas, mostrando lucro líquido por mês
  - Permite seleção de período para análise personalizada

## 💡 Diferenciais do Projeto

- Interface moderna, responsiva e amigável
- Feedback visual em todas as ações do usuário
- Segurança reforçada com hash de senhas
- Estrutura modular e escalável

## 📦 Como Executar

1. Clone o repositório
2. Instale as dependências Python:  
   `pip install -r requirements.txt`
3. Configure as variáveis de ambiente para acesso ao MySQL
4. Execute o servidor Flask:  
   `python run.py`
5. Acesse `http://localhost:5000` pelo navegador

---

> Projeto em desenvolvimento. Funcionalidade de "esqueci minha senha" em breve.

---

*Desenvolvido por [Seu Nome]*
