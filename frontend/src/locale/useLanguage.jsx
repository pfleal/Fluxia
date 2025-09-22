import languages from '@/locale/translation/translation';

const getLabel = (key, langCode = 'pt_br') => {
  try {
    const lowerCaseKey = key
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/ /g, '_');

    // Tenta obter a tradução do arquivo de idioma
    const lang = languages[langCode];
    if (lang && lang[lowerCaseKey]) return lang[lowerCaseKey];

    // Se não encontrar, converte a chave para um formato legível
    const remove_underscore_fromKey = key.replace(/_/g, ' ').split(' ');

    const conversionOfAllFirstCharacterofEachWord = remove_underscore_fromKey.map(
      (word) => word[0].toUpperCase() + word.substring(1)
    );

    const label = conversionOfAllFirstCharacterofEachWord.join(' ');

    const result = window.localStorage.getItem('lang');
    if (!result) {
      let list = {};
      list[lowerCaseKey] = label;
      window.localStorage.setItem('lang', JSON.stringify(list));
    } else {
      let list = { ...JSON.parse(result) };
      list[lowerCaseKey] = label;
      window.localStorage.removeItem('lang');
      window.localStorage.setItem('lang', JSON.stringify(list));
    }
    
    return label;
  } catch (error) {
    return 'No translate';
  }
};

const useLanguage = () => {
  // Definindo o idioma padrão como português
  const currentLang = 'pt_br';
  
  const translate = (value) => getLabel(value, currentLang);

  return translate;
};

export default useLanguage;
