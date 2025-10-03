const codeMessage = {
  200: 'O servidor retornou com sucesso os dados solicitados.',
  201: 'Dados criados ou modificados com sucesso.',
  202: 'Uma solicitação entrou na fila de segundo plano (tarefa assíncrona).',
  204: 'Dados excluídos com sucesso.',
  400: 'Houve um erro na solicitação enviada, e o servidor não criou ou modificou dados.',
  401: 'O administrador não tem permissão, tente fazer login novamente.',
  403: 'O administrador está autorizado, mas o acesso é proibido.',
  404: 'A solicitação enviada é para um registro que não existe, e o servidor não está operando.',
  406: 'O formato solicitado não está disponível.',
  410: 'O recurso solicitado foi excluído permanentemente e não estará mais disponível.',
  422: 'Ao criar um objeto, ocorreu um erro de validação.',
  500: 'Ocorreu um erro no servidor, verifique o servidor.',
  502: 'Erro de gateway.',
  503: 'O serviço não está disponível, o servidor está temporariamente sobrecarregado ou em manutenção.',
  504: 'O gateway expirou.',
};

export default codeMessage;
