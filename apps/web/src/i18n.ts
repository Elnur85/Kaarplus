import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files - Estonian
import commonEt from '../messages/et/common.json';
import homeEt from '../messages/et/home.json';
import listingsEt from '../messages/et/listings.json';
import authEt from '../messages/et/auth.json';
import errorsEt from '../messages/et/errors.json';
import sellEt from '../messages/et/sell.json';
import dashboardEt from '../messages/et/dashboard.json';
import adminEt from '../messages/et/admin.json';
import carDetailEt from '../messages/et/carDetail.json';
import checkoutEt from '../messages/et/checkout.json';
import compareEt from '../messages/et/compare.json';
import reviewsEt from '../messages/et/reviews.json';
import messagesEt from '../messages/et/messages.json';
import searchEt from '../messages/et/search.json';
import favoritesEt from '../messages/et/favorites.json';
import inspectionEt from '../messages/et/inspection.json';
import legalEt from '../messages/et/legal.json';
import dealershipEt from '../messages/et/dealership.json';
import mobileAppEt from '../messages/et/mobileApp.json';
import adsEt from '../messages/et/ads.json';

// Import translation files - Russian
import commonRu from '../messages/ru/common.json';
import homeRu from '../messages/ru/home.json';
import listingsRu from '../messages/ru/listings.json';
import authRu from '../messages/ru/auth.json';
import errorsRu from '../messages/ru/errors.json';
import sellRu from '../messages/ru/sell.json';
import dashboardRu from '../messages/ru/dashboard.json';
import adminRu from '../messages/ru/admin.json';
import carDetailRu from '../messages/ru/carDetail.json';
import checkoutRu from '../messages/ru/checkout.json';
import compareRu from '../messages/ru/compare.json';
import reviewsRu from '../messages/ru/reviews.json';
import messagesRu from '../messages/ru/messages.json';
import searchRu from '../messages/ru/search.json';
import favoritesRu from '../messages/ru/favorites.json';
import inspectionRu from '../messages/ru/inspection.json';
import legalRu from '../messages/ru/legal.json';
import dealershipRu from '../messages/ru/dealership.json';
import mobileAppRu from '../messages/ru/mobileApp.json';
import adsRu from '../messages/ru/ads.json';

// Import translation files - English
import commonEn from '../messages/en/common.json';
import homeEn from '../messages/en/home.json';
import listingsEn from '../messages/en/listings.json';
import authEn from '../messages/en/auth.json';
import errorsEn from '../messages/en/errors.json';
import sellEn from '../messages/en/sell.json';
import dashboardEn from '../messages/en/dashboard.json';
import adminEn from '../messages/en/admin.json';
import carDetailEn from '../messages/en/carDetail.json';
import checkoutEn from '../messages/en/checkout.json';
import compareEn from '../messages/en/compare.json';
import reviewsEn from '../messages/en/reviews.json';
import messagesEn from '../messages/en/messages.json';
import searchEn from '../messages/en/search.json';
import favoritesEn from '../messages/en/favorites.json';
import inspectionEn from '../messages/en/inspection.json';
import legalEn from '../messages/en/legal.json';
import dealershipEn from '../messages/en/dealership.json';
import mobileAppEn from '../messages/en/mobileApp.json';
import adsEn from '../messages/en/ads.json';

const resources = {
    et: {
        common: commonEt,
        home: homeEt,
        listings: listingsEt,
        auth: authEt,
        errors: errorsEt,
        sell: sellEt,
        dashboard: dashboardEt,
        admin: adminEt,
        carDetail: carDetailEt,
        checkout: checkoutEt,
        compare: compareEt,
        reviews: reviewsEt,
        messages: messagesEt,
        search: searchEt,
        favorites: favoritesEt,
        inspection: inspectionEt,
        legal: legalEt,
        dealership: dealershipEt,
        mobileApp: mobileAppEt,
        ads: adsEt,
    },
    ru: {
        common: commonRu,
        home: homeRu,
        listings: listingsRu,
        auth: authRu,
        errors: errorsRu,
        sell: sellRu,
        dashboard: dashboardRu,
        admin: adminRu,
        carDetail: carDetailRu,
        checkout: checkoutRu,
        compare: compareRu,
        reviews: reviewsRu,
        messages: messagesRu,
        search: searchRu,
        favorites: favoritesRu,
        inspection: inspectionRu,
        legal: legalRu,
        dealership: dealershipRu,
        mobileApp: mobileAppRu,
        ads: adsRu,
    },
    en: {
        common: commonEn,
        home: homeEn,
        listings: listingsEn,
        auth: authEn,
        errors: errorsEn,
        sell: sellEn,
        dashboard: dashboardEn,
        admin: adminEn,
        carDetail: carDetailEn,
        checkout: checkoutEn,
        compare: compareEn,
        reviews: reviewsEn,
        messages: messagesEn,
        search: searchEn,
        favorites: favoritesEn,
        inspection: inspectionEn,
        legal: legalEn,
        dealership: dealershipEn,
        mobileApp: mobileAppEn,
        ads: adsEn,
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
            prefix: '{',
            suffix: '}',
        },
    });

export default i18n;
