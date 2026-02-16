import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import commonEt from '../messages/et/common.json';
import commonRu from '../messages/ru/common.json';
import commonEn from '../messages/en/common.json';
import homeEt from '../messages/et/home.json';
import homeRu from '../messages/ru/home.json';
import homeEn from '../messages/en/home.json';

const resources = {
    et: {
        common: commonEt,
        home: homeEt,
    },
    ru: {
        common: commonRu,
        home: homeRu,
    },
    en: {
        common: commonEn,
        home: homeEn,
    },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'et', // default language
        fallbackLng: 'et',
        defaultNS: 'common',
        interpolation: {
            escapeValue: false, // React already escapes values
        },
    });

export default i18n;
