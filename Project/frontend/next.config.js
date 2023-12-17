/** @type {import('next').NextConfig} */
const nextConfig = {}

const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const withTM = require("next-transpile-modules")([
  "monaco-editor"
]);

module.exports = withTM({
    webpack: (config, options) => {
        if (options.isServer) config.plugins.push(new MonacoWebpackPlugin());
        const rule = config.module.rules.file(rule => 
            rule.oneOf).oneOf.find(r => r.issuer && r.issuer.include && r.issuer.include.includes('_app'));
        if (rule) {
            rule.issuer.include = [
                rule.issuer.include,
                /[\\/]node_modules[\\/]monaco-editor[\\/]/,
            ]
        }
    }    
});

module.exports = nextConfig
module.exports = {
    images: {
        domains: ['s3.storage.selcloud.ru'],
    }
}
