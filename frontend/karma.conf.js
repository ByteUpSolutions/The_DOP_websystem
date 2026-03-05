// karma.conf.js — Configuração do Karma para execução em container Docker (sem Chrome instalado)
// Usa Chromium com flags headless compatíveis com ambientes de CI/Docker.

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage'),
            require('@angular-devkit/build-angular/plugins/karma'),
        ],
        client: {
            jasmine: {
                // Reporta detalhes de cada spec no log do container
            },
            clearContext: false,
        },
        jasmineHtmlReporter: {
            suppressAll: true,
        },
        coverageReporter: {
            dir: require('path').join(__dirname, './coverage'),
            subdir: '.',
            reporters: [{ type: 'html' }, { type: 'text-summary' }],
        },
        reporters: ['progress', 'kjhtml'],
        // Porta diferente da padrão para evitar conflito com outros processos no container
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        // ───────────────────────────────────────────────────────────────────────
        // ChromeHeadlessNoSandbox: necessário para rodar dentro de containers
        // Docker, onde o Linux não tem namespace isolation suficiente para o
        // sandbox do Chrome. As flags abaixo são o padrão recomendado para CI.
        // ───────────────────────────────────────────────────────────────────────
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: [
                    '--no-sandbox',
                    '--disable-gpu',
                    '--disable-dev-shm-usage',
                    '--disable-setuid-sandbox',
                    '--remote-debugging-port=9222',
                ],
            },
        },
        browsers: ['ChromeHeadlessNoSandbox'],
        singleRun: true,
        restartOnFileChange: false,
    });
};
