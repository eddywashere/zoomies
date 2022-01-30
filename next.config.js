/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
};

const { withGlobalCss } = require("next-global-css");

const withConfig = withGlobalCss();

module.exports = withConfig(nextConfig);
