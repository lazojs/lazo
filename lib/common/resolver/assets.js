define(['underscore'], function (_) {

    'use strict';

    return {

        keyRegex: /^(?:[a-z]{2}(?:-[A-Z]{2})?[\/\\])(.+)/,

        getLocales: function (ctx) {
            var languages = [];

            if (LAZO.isClient) {
                return languages.concat(navigator.languages || [navigator.language]);
            } else {
                return languages.concat(this.resolveAcceptLanguge(ctx._request.raw.req.headers['accept-language']));
            }
        },

        resolveAsset: function (key, list, ctx) {
            var locales = this.getLocales(ctx);
            var i = 0;
            var asset;
            var lookup;

            locales.push('defaults');
            i = locales.length;
            while (i--) {
                lookup = list[locales[i]][key];
                asset = _.isUndefined(lookup) ? asset : lookup;
            }

            return asset;
        },

        resolveAssetKey: function (key, ctx) {
            return key.replace(this.keyRegex, '$1');
        },

        resolveAssetPath: function (path, component, ctx) {
            var prefix = component === 'app' ? '/' : '/components/';
            return prefix + component + '/assets/' + path;
        },

        resolveAcceptLanguge: function (languages, ctx) {
            languages = _.map(languages.split(','), function (language) {
                var langQuality = language.split(';');
                var languageParts = langQuality[0].split('-');
                return {
                    language: languageParts[0],
                    langLocale: langQuality[0],
                    quality: langQuality[1] ? parseFloat(langQuality[1].split('=')[1]) : 1
                };
            });

            languages.sort(function (a, b) {
                if (a.language === b.language) {
                    if (a.quality < b.quality) {
                        return 1;
                    }
                    if (a.quality > b.quality) {
                        return -1;
                    }
                }

                return 0;
            });

            return _.map(languages, function (lang) {
                return lang.langLocale;
            });
        }

    };

});