/** @type {import('next').NextConfig} */
//const withPlugins = require("next-compose-plugins");
const withTM = require("next-transpile-modules")(["backend"]);
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};
module.exports = withTM(nextConfig);
