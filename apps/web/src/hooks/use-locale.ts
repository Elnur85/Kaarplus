import { useTranslation } from 'react-i18next';
import { et, enUS, ru } from 'date-fns/locale';

export function useLocale() {
    const { i18n } = useTranslation();

    const getLocale = () => {
        const lang = i18n.language;
        if (lang === 'ru' || lang === 'ru-RU') return ru;
        if (lang === 'en' || lang === 'en-US' || lang === 'en-GB') return enUS;
        return et;
    };

    return getLocale();
}
